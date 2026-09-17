import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const KEY='airportTransferBookingsV2', SKEY='airportTransferSchedulesV2';
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let bookings=JSON.parse(localStorage.getItem(KEY)||'[]');
let schedules=JSON.parse(localStorage.getItem(SKEY)||'[]');
let currentUser=null, currentRole=null, db=null, auth=null, firebaseReady=false, filter='All';

async function initFirebase(){
  if(!firebaseConfigured) return;
  try{
    const app=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
    const authMod=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js');
    const fs=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js');
    const fb=app.initializeApp(firebaseConfig);
    auth=authMod.getAuth(fb); db=fs.getFirestore(fb);
    const {onAuthStateChanged}=authMod;
    onAuthStateChanged(auth,u=>{currentUser=u; if(u && !currentRole) currentRole=localStorage.getItem('atRole')||'customer'; updateAuthUI(); if(currentRole==='driver') loadCloudSchedules(); if(currentRole==='admin') loadCloudBookings();});
    window.FB={...authMod,...fs}; firebaseReady=true;
    $('#modeNotice').textContent='Firebase mode: sign in to sync data across devices.';
  }catch(err){console.error(err); $('#modeNotice').textContent='Firebase could not start; demo mode is active.';}
}

function saveLocal(){localStorage.setItem(KEY,JSON.stringify(bookings));localStorage.setItem(SKEY,JSON.stringify(schedules));render();}
function show(id){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active');render();updateAuthUI();}
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));

function updateAuthUI(){
 const signed=!!currentUser;
 $('#customerAuth').classList.toggle('hidden',firebaseReady&&signed);
 $('#bookingForm').classList.toggle('hidden',firebaseReady&&!signed);
 $('#customerLogout').classList.toggle('hidden',!signed);
 $('#driverAuth').classList.toggle('hidden',firebaseReady&&signed&&currentRole==='driver');
 $('#driverArea').classList.toggle('hidden',firebaseReady&&(!signed||currentRole!=='driver'));
 $('#driverLogout').classList.toggle('hidden',!(signed&&currentRole==='driver'));
 $('#adminAuth').classList.toggle('hidden',firebaseReady&&signed&&currentRole==='admin');
 $('#adminArea').classList.toggle('hidden',firebaseReady&&(!signed||currentRole!=='admin'));
 if(!firebaseReady){$('#customerAuth').classList.add('hidden');$('#bookingForm').classList.remove('hidden');$('#driverAuth').classList.add('hidden');$('#driverArea').classList.remove('hidden');$('#adminAuth').classList.add('hidden');$('#adminArea').classList.remove('hidden');}
}

async function signUp(role,email,password){
 if(!firebaseReady) return alert('Demo mode: Firebase is not configured yet.');
 try{const r=await window.FB.createUserWithEmailAndPassword(auth,email,password); currentUser=r.user; currentRole=role; localStorage.setItem('atRole',role); await window.FB.setDoc(window.FB.doc(db,'users',r.user.uid),{email,role,createdAt:window.FB.serverTimestamp()}); updateAuthUI(); render(); alert('Account created.');}
 catch(e){alert(e.message);}
}
async function signIn(role,email,password){
 if(!firebaseReady) return;
 try{const r=await window.FB.signInWithEmailAndPassword(auth,email,password); currentUser=r.user; currentRole=role; localStorage.setItem('atRole',role); if(role==='admin'){const snap=await window.FB.getDoc(window.FB.doc(db,'users',r.user.uid)); if(!snap.exists()||snap.data().role!=='admin'){await window.FB.signOut(auth);currentUser=null;currentRole=null;return alert('This account is not an admin account.');}} updateAuthUI(); render();}
 catch(e){alert(e.message);}
}
async function logout(){if(firebaseReady&&auth) await window.FB.signOut(auth);currentUser=null;currentRole=null;localStorage.removeItem('atRole');updateAuthUI();render();}

$('#customerSignup').onclick=()=>signUp('customer',$('#customerEmail').value,$('#customerPassword').value);
$('#customerLogin').onclick=()=>signIn('customer',$('#customerEmail').value,$('#customerPassword').value);
$('#driverSignup').onclick=()=>signUp('driver',$('#driverEmail').value,$('#driverPassword').value);
$('#driverLogin').onclick=()=>signIn('driver',$('#driverEmail').value,$('#driverPassword').value);
$('#adminLogin').onclick=()=>signIn('admin',$('#adminEmail').value,$('#adminPassword').value);
$('#customerLogout').onclick=logout; $('#driverLogout').onclick=logout;

async function addBooking(b){
 if(firebaseReady){await window.FB.addDoc(window.FB.collection(db,'bookings'),{...b,customerUid:currentUser?.uid||null,createdAt:window.FB.serverTimestamp()}); await loadCloudBookingsForCustomer();}
 else {bookings.unshift(b);saveLocal();}
}
$('#bookingForm').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);const b={id:'AT-'+Date.now().toString().slice(-6),name:f.get('name'),phone:f.get('phone'),pickup:f.get('pickup'),destination:f.get('destination'),date:f.get('date'),time:f.get('time'),passengers:Number(f.get('passengers')),luggage:Number(f.get('luggage')||0),language:f.get('language'),status:'Available',driver:'',driverUid:''};try{await addBooking(b);e.target.reset();$('#customerResult').innerHTML=`<div class="booking success"><h3>Booking placed ✓</h3><p>Your booking ID is <b>${b.id}</b>.</p><span class="badge">Available</span></div>`;}catch(err){alert(err.message);}});

async function loadCloudBookings(){if(!firebaseReady)return;const snap=await window.FB.getDocs(window.FB.collection(db,'bookings'));bookings=snap.docs.map(d=>({docId:d.id,...d.data()}));render();}
async function loadCloudBookingsForCustomer(){if(!firebaseReady||!currentUser)return;const q=window.FB.query(window.FB.collection(db,'bookings'),window.FB.where('customerUid','==',currentUser.uid));const snap=await window.FB.getDocs(q);bookings=snap.docs.map(d=>({docId:d.id,...d.data()}));render();}
async function loadCloudSchedules(){if(!firebaseReady||!currentUser)return;const q=window.FB.query(window.FB.collection(db,'driverSchedules'),window.FB.where('driverUid','==',currentUser.uid));const snap=await window.FB.getDocs(q);schedules=snap.docs.map(d=>({docId:d.id,...d.data()}));render();}

function overlapsSchedule(b,s){if(!s||s.date!==b.date)return false;return String(b.time)>=String(s.from)&&String(b.time)<=String(s.to);}
function canDriverTake(b){return !schedules.some(s=>overlapsSchedule(b,s));}
async function acceptJob(id){const b=bookings.find(x=>(x.docId||x.id)===id);if(!b)return;if(!canDriverTake(b))return alert('You have an unavailable schedule overlapping this booking.');if(firebaseReady){await window.FB.updateDoc(window.FB.doc(db,'bookings',b.docId),{status:'Accepted',driver:currentUser.email,driverUid:currentUser.uid,acceptedAt:window.FB.serverTimestamp()});await loadCloudBookings();}else{b.status='Accepted';b.driver='Demo Driver';saveLocal();}}
window.acceptJob=acceptJob;

async function addUnavailable(){const date=$('#unavailableDate').value,from=$('#unavailableFrom').value,to=$('#unavailableTo').value;if(!date||!from||!to||from>=to)return alert('Please enter a valid unavailable date and time.');const s={date,from,to,driverUid:currentUser?.uid||'demo'};if(firebaseReady){await window.FB.addDoc(window.FB.collection(db,'driverSchedules'),s);await loadCloudSchedules();}else{s.id='S-'+Date.now();schedules.push(s);saveLocal();}}
$('#addUnavailable').onclick=addUnavailable;

function renderSchedules(){const el=$('#scheduleList');el.innerHTML=schedules.length?schedules.map(s=>`<div class="schedule"><b>${s.date}</b><span>${s.from}–${s.to}</span></div>`).join(''):'<p class="muted">No unavailable times added.</p>';}
function render(){
 renderSchedules();
 const available=bookings.filter(b=>b.status==='Available'&&canDriverTake(b));
 $('#driverJobs').innerHTML=available.length?available.map(b=>`<div class="booking"><h3>${b.pickup} → ${b.destination}</h3><p>${b.date} at ${b.time} • ${b.passengers} passenger(s) • ${b.language}</p><small>${b.name} • ${b.id}</small><button class="accept" onclick="acceptJob('${b.docId||b.id}')">Accept job</button></div>`).join(''):'<p class="muted">No available jobs matching your schedule.</p>';
 const total=bookings.length, av=bookings.filter(b=>b.status==='Available').length, ac=bookings.filter(b=>b.status==='Accepted').length, co=bookings.filter(b=>b.status==='Completed').length;
 $('#adminStats').innerHTML=`<div class="stat"><b>${total}</b><small>Total</small></div><div class="stat"><b>${av}</b><small>Available</small></div><div class="stat"><b>${ac}</b><small>Accepted</small></div><div class="stat"><b>${co}</b><small>Completed</small></div>`;
 const list=filter==='All'?bookings:bookings.filter(b=>b.status===filter);$('#adminBookings').innerHTML=list.length?list.map(b=>`<div class="booking"><h3>${b.id} <span class="badge">${b.status}</span></h3><p><b>${b.pickup}</b> → ${b.destination}</p><p>${b.date} ${b.time} • ${b.name} • ${b.phone}</p><small>${b.driver?`Driver: ${b.driver}`:'No driver yet'}</small>${b.status==='Accepted'?`<button class="secondary complete" onclick="completeJob('${b.docId||b.id}')">Mark completed</button>`:''}</div>`).join(''):'<p class="muted">No bookings.</p>';
 if(firebaseReady&&currentUser&&currentRole==='customer') loadCloudBookingsForCustomer();
}
window.completeJob=async id=>{const b=bookings.find(x=>(x.docId||x.id)===id);if(!b)return;if(firebaseReady)await window.FB.updateDoc(window.FB.doc(db,'bookings',b.docId),{status:'Completed',completedAt:window.FB.serverTimestamp()});else{b.status='Completed';saveLocal();}if(firebaseReady)await loadCloudBookings();};
$$('.filter').forEach(x=>x.onclick=()=>{$$('.filter').forEach(y=>y.classList.remove('active'));x.classList.add('active');filter=x.dataset.filter;render();});
$('#clearAll').onclick=()=>{if(firebaseReady)return alert('Cloud data is protected; use Firestore/admin tools for deletion.');if(confirm('Clear all demo bookings?')){bookings=[];saveLocal();}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js');
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}};
initFirebase();updateAuthUI();render();

const KEY='airportTransferBookings';
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
let bookings=JSON.parse(localStorage.getItem(KEY)||'[]');

function save(){localStorage.setItem(KEY,JSON.stringify(bookings));render();}
function show(id){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active');render();}
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));

$('#bookingForm').addEventListener('submit',e=>{
 e.preventDefault(); const f=new FormData(e.target);
 const b={id:'AT-'+Date.now().toString().slice(-6),name:f.get('name'),phone:f.get('phone'),pickup:f.get('pickup'),destination:f.get('destination'),date:f.get('date'),time:f.get('time'),passengers:f.get('passengers'),luggage:f.get('luggage'),language:f.get('language'),status:'Available',driver:''};
 bookings.unshift(b); save(); e.target.reset();
 $('#customerResult').innerHTML=`<div class="booking"><h3>Booking placed ✓</h3><p>Your booking ID is <b>${b.id}</b>.</p><span class="badge">${b.status}</span></div>`;
});

function render(){
 const available=bookings.filter(b=>b.status==='Available');
 $('#driverJobs').innerHTML=available.length?available.map(b=>`<div class="booking"><h3>${b.pickup} → ${b.destination}</h3><p>${b.date} at ${b.time} • ${b.passengers} passenger(s) • ${b.language}</p><small>${b.name} • ${b.id}</small><button class="accept" onclick="acceptJob('${b.id}')">Accept job</button></div>`).join(''):'<p class="muted">No available jobs.</p>';
 const accepted=bookings.filter(b=>b.status==='Accepted').length;
 $('#adminStats').innerHTML=`<div class="stat"><b>${bookings.length}</b><small>Total</small></div><div class="stat"><b>${available.length}</b><small>Available</small></div><div class="stat"><b>${accepted}</b><small>Accepted</small></div>`;
 $('#adminBookings').innerHTML=bookings.length?bookings.map(b=>`<div class="booking"><h3>${b.id} <span class="badge">${b.status}</span></h3><p><b>${b.pickup}</b> → ${b.destination}</p><p>${b.date} ${b.time} • ${b.name} • ${b.phone}</p><small>${b.driver?`Driver: ${b.driver}`:'No driver yet'}</small></div>`).join(''):'<p class="muted">No bookings yet.</p>';
}
window.acceptJob=id=>{const b=bookings.find(x=>x.id===id);if(b){b.status='Accepted';b.driver='Demo Driver';save();}};
$('#clearAll').addEventListener('click',()=>{if(confirm('Clear all demo bookings?')){bookings=[];save();}});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
let deferredPrompt; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}});
render();

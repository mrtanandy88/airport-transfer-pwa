const ADMIN_DRIVER_MODULE_VERSION='1.1';

(async function(){
  const waitForFirebase=()=>new Promise(resolve=>{
    const check=()=>{
      if(window.FB && window.FB.getAuth && window.FB.getFirestore){ resolve(); return; }
      setTimeout(check,100);
    };
    check();
  });

  await waitForFirebase();

  const F=window.FB;
  let auth;
  try{ auth=F.getAuth(); }catch(e){ console.error('Admin driver module auth error',e); return; }
  const db=F.getFirestore();

  const state={drivers:[],profiles:new Map(),schedules:[],bookings:[],role:null};

  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const host=()=>document.querySelector('#adminDrivers');
  const search=()=>String(document.querySelector('#adminDriverSearch')?.value||'').trim().toLowerCase();
  const clearSearch=()=>{const input=document.querySelector('#adminDriverSearch');if(input)input.value='';render();input?.focus();};

  function formatDate(v){
    if(!v)return '';
    const d=new Date(String(v).length===10?v+'T00:00:00':v);
    return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-MY',{day:'2-digit',month:'short',year:'numeric'});
  }

  function whatsapp(number,name){
    const n=String(number||'').replace(/\D/g,'');
    return n?'https://wa.me/'+n+'?text='+encodeURIComponent('Hello '+(name||'')+', this is Airport Transfer admin.'):'#';
  }

  function scheduleHtml(driverUid){
    const rows=state.schedules.filter(s=>s.driverUid===driverUid).sort((a,b)=>String(a.date+a.from).localeCompare(String(b.date+b.from)));
    if(!rows.length)return '<p class="muted">No private unavailable schedule.</p>';
    return rows.map(s=>'<div class="admin-driver-schedule"><b>'+esc(formatDate(s.date))+'</b><span>'+esc(s.from||'')+' – '+esc(s.to||'')+'</span></div>').join('');
  }

  function render(){
    const el=host();
    if(!el || state.role!=='admin')return;

    const q=search();
    const rows=state.drivers.filter(d=>{
      const p=state.profiles.get(d.docId)||{};
      const hay=[
        d.displayName,d.email,d.vehicleType,d.carModel,d.carColor,d.plateNumber,d.whatsappNumber,
        p.displayName,p.vehicleType,p.carModel,p.carColor,p.plateNumber,p.whatsappNumber,
        ...(d.languages||[]),...(p.languages||[])
      ].join(' ').toLowerCase();
      return !q || hay.includes(q);
    }).sort((a,b)=>String(a.displayName||a.email||'').localeCompare(String(b.displayName||b.email||'')));

    const onJobCount=state.drivers.filter(d=>state.bookings.some(b=>b.driverUid===d.docId && b.status==='Accepted')).length;
    el.innerHTML='<div class="driver-admin-stats">'+
      '<div><b>'+state.drivers.length+'</b><small>Registered</small></div>'+
      '<div><b>'+Math.max(0,state.drivers.length-onJobCount)+'</b><small>Not on job</small></div>'+
      '<div><b>'+onJobCount+'</b><small>On job</small></div>'+
      '</div>'+
      (rows.length?rows.map(card).join(''):'<div class="driver-admin-empty">No registered drivers match your search.</div>');
  }

  function card(d){
    const p=state.profiles.get(d.docId)||{};
    const name=p.displayName||d.displayName||'Unnamed driver';
    const vehicle=p.vehicleType||d.vehicleType||'Not set';
    const model=p.carModel||d.carModel||'Not provided';
    const color=p.carColor||d.carColor||'Not provided';
    const plate=p.plateNumber||d.plateNumber||'Not provided';
    const wa=p.whatsappNumber||d.whatsappNumber||'';
    const languages=p.languages||d.languages||[];
    const selfie=p.selfieDataUrl||'';
    const car=p.carPhotoDataUrl||'';
    const active=state.bookings.filter(b=>b.driverUid===d.docId && b.status==='Accepted');
    const completed=state.bookings.filter(b=>b.driverUid===d.docId && b.status==='Completed');
    const status=active.length?'On Job':'Registered';

    const jobs=active.length
      ?active.map(b=>'<div class="admin-driver-job"><b>'+esc(b.id||b.docId)+'</b> • '+esc(b.date||'')+' '+esc(b.time||'')+'<br>'+esc(b.pickup||'')+' → '+esc(b.destination||'')+'</div>').join('')
      :'<p class="muted">No active job.</p>';

    return '<article class="admin-driver-card">'+
      '<div class="admin-driver-head">'+
        '<div class="admin-driver-avatar">'+(selfie?'<img src="'+selfie+'" alt="Driver photo">':'👤')+'</div>'+
        '<div class="admin-driver-main">'+
          '<div class="admin-driver-title"><h3>'+esc(name)+'</h3><span class="admin-driver-status '+(active.length?'onjob':'registered')+'">'+status+'</span></div>'+
          '<p>'+esc(vehicle)+' • '+esc(model)+' • '+esc(color)+'</p>'+
          '<span class="admin-driver-plate">'+esc(plate)+'</span>'+
        '</div>'+
      '</div>'+
      '<div class="admin-driver-photos">'+
        (selfie?'<div><img src="'+selfie+'" alt="Driver selfie"><small>Driver selfie</small></div>':'')+
        (car?'<div><img src="'+car+'" alt="Car photo"><small>Vehicle photo</small></div>':'')+
      '</div>'+
      '<div class="admin-driver-grid">'+
        '<div><small>EMAIL</small><b>'+esc(d.email||'Not provided')+'</b></div>'+
        '<div><small>WHATSAPP</small><b>'+esc(wa||'Not provided')+'</b></div>'+
        '<div><small>LANGUAGES</small><b>'+esc(languages.join(', ')||'None')+'</b></div>'+
        '<div><small>COMPLETED</small><b>'+completed.length+'</b></div>'+
      '</div>'+
      '<details class="admin-driver-details">'+
        '<summary>View full driver details</summary>'+
        '<div class="admin-driver-detail-section"><h4>🚗 Vehicle</h4><p>Type: <b>'+esc(vehicle)+'</b><br>Model: <b>'+esc(model)+'</b><br>Colour: <b>'+esc(color)+'</b><br>Plate: <b>'+esc(plate)+'</b></p></div>'+
        '<div class="admin-driver-detail-section"><h4>📱 Contact</h4><p>Email: <b>'+esc(d.email||'Not provided')+'</b><br>WhatsApp: <b>'+esc(wa||'Not provided')+'</b></p></div>'+
        '<div class="admin-driver-detail-section"><h4>🗣️ Languages</h4><p>'+esc(languages.join(', ')||'None provided')+'</p></div>'+
        '<div class="admin-driver-detail-section"><h4>📅 Private unavailable schedule</h4>'+scheduleHtml(d.docId)+'</div>'+
        '<div class="admin-driver-detail-section"><h4>🧳 Current / active jobs</h4>'+jobs+'</div>'+
        '<div class="admin-driver-detail-section"><h4>🆔 Account</h4><p>Driver UID: <code>'+esc(d.docId)+'</code></p></div>'+
      '</details>'+
      '<div class="admin-driver-actions">'+
        (wa?'<a class="whatsapp-button" href="'+whatsapp(wa,name)+'" target="_blank" rel="noopener">💬 WhatsApp driver</a>':'')+
        (d.email?'<a class="map-link" href="mailto:'+encodeURIComponent(d.email)+'">✉️ Email</a>':'')+
        '<button type="button" class="danger admin-driver-remove" data-remove-driver="'+esc(d.docId)+'">🗑️ Remove duplicate data</button>'+
      '</div>'+
    '</article>';
  }

  function startListeners(){
    const unsub=[];
    unsub.push(F.onSnapshot(F.collection(db,'users'),snap=>{
      state.drivers=snap.docs.map(d=>({docId:d.id,...d.data()})).filter(d=>d.role==='driver');
      render();
    },e=>console.error('Admin driver users listener',e)));
    unsub.push(F.onSnapshot(F.collection(db,'driverPublicProfiles'),snap=>{
      state.profiles=new Map(snap.docs.map(d=>[d.id,d.data()]));
      render();
    },e=>console.error('Admin driver profiles listener',e)));
    unsub.push(F.onSnapshot(F.collection(db,'driverSchedules'),snap=>{
      state.schedules=snap.docs.map(d=>({docId:d.id,...d.data()}));
      render();
    },e=>console.error('Admin driver schedules listener',e)));
    unsub.push(F.onSnapshot(F.collection(db,'bookings'),snap=>{
      state.bookings=snap.docs.map(d=>({docId:d.id,...d.data()}));
      render();
    },e=>console.error('Admin driver bookings listener',e)));
    return ()=>unsub.forEach(fn=>{try{fn();}catch(_){}}); 
  }

  let stop=null;
  F.onAuthStateChanged(auth,async user=>{
    if(stop){stop();stop=null;}
    state.role=null;state.drivers=[];state.profiles.clear();state.schedules=[];state.bookings=[];render();
    if(!user)return;
    try{
      const snap=await F.getDoc(F.doc(db,'users',user.uid));
      state.role=snap.exists()?snap.data().role:null;
      if(state.role==='admin')stop=startListeners();
      render();
    }catch(e){console.error('Admin driver role check',e);}
  });

  document.addEventListener('click',async e=>{
    if(e.target?.id==='adminDriverSearchButton'){render();return;}
    if(e.target?.id==='adminDriverSearchClear'){clearSearch();return;}
    const btn=e.target?.closest('[data-remove-driver]');
    if(!btn)return;
    const uid=btn.getAttribute('data-remove-driver');
    const driver=state.drivers.find(d=>d.docId===uid);
    if(!driver)return;
    const email=driver.email||'';
    const typed=window.prompt('Type this duplicate driver email to confirm Firestore cleanup:\n\n'+email);
    if(typed===null)return;
    if(String(typed).trim().toLowerCase()!==email.trim().toLowerCase()){
      window.alert('Email does not match. No data was deleted.');
      return;
    }
    await removeDriverFirestoreData(uid);
  });
  document.addEventListener('input',e=>{if(e.target?.id==='adminDriverSearch')render();});

  async function removeDriverFirestoreData(uid){
    if(state.role!=='admin')return;
    const driver=state.drivers.find(d=>d.docId===uid);
    const email=driver?.email||uid;
    const active=state.bookings.some(b=>b.driverUid===uid && ['Accepted','OnTheWay','ArrivedPickup','PickedUp','ArrivedDestination','DroppedOff'].includes(b.tripStatus||b.status));
    if(active){
      window.alert('This driver has an active trip. Finish or reassign the trip before removing the driver data.');
      return;
    }
    try{
      const batch=F.writeBatch(db);
      batch.delete(F.doc(db,'users',uid));
      batch.delete(F.doc(db,'driverPublicProfiles',uid));
      const schedules=await F.getDocs(F.query(F.collection(db,'driverSchedules'),F.where('driverUid','==',uid)));
      schedules.forEach(d=>batch.delete(d.ref));
      await batch.commit();
      window.alert('Firestore driver records removed for '+email+'. The Firebase Authentication login still exists. Delete the Authentication user separately in Firebase Console → Authentication → Users.');
    }catch(err){
      console.error('Remove driver data',err);
      window.alert('Could not remove driver data: '+(err?.message||err));
    }
  }
})();
(() => {
  let leafletPromise=null, map=null, marker=null, activeTarget=null, selected=null;
  const $=s=>document.querySelector(s);
  function loadLeaflet(){
    if(leafletPromise) return leafletPromise;
    leafletPromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link'); css.rel='stylesheet'; css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
      const script=document.createElement('script'); script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload=()=>resolve(); script.onerror=()=>reject(new Error('Could not load the map. Please check your internet connection.')); document.head.appendChild(script);
    });
    return leafletPromise;
  }
  function setFields(target,lat,lng){
    const latEl=$('#bookingForm input[name="'+target+'Lat"]'), lngEl=$('#bookingForm input[name="'+target+'Lng"]');
    if(latEl)latEl.value=lat.toFixed(6); if(lngEl)lngEl.value=lng.toFixed(6);
    const status=target==='pickup'?$('#pickupLocationStatus'):null;
    if(status)status.textContent='✓ Map pin saved. You can still edit the address above.';
  }
  function openPicker(target){
    if(!window.currentRoleForMap || window.currentRoleForMap!=='customer') return;
    activeTarget=target; selected=null;
    const modal=$('#mapPickerModal'); modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
    $('#mapPickerTitle').textContent=target==='pickup'?'Pick pickup location':'Pick drop-off location';
    $('#mapPickerHint').textContent=target==='pickup'?'Tap the map where the customer should be picked up.':'Tap the map where the customer should be dropped off.';
    $('#mapPickerCoords').textContent='No location selected.'; $('#confirmMapLocation').disabled=true;
    loadLeaflet().then(()=>{
      const latEl=$('#bookingForm input[name="'+target+'Lat"]'),lngEl=$('#bookingForm input[name="'+target+'Lng"]');
      const lat=latEl&&latEl.value?Number(latEl.value):2.7456, lng=lngEl&&lngEl.value?Number(lngEl.value):101.7072;
      if(!map){
        map=L.map('mapPicker').setView([lat,lng],13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
        map.on('click',e=>choose(e.latlng.lat,e.latlng.lng));
      } else { map.invalidateSize(); map.setView([lat,lng],13); }
      if(latEl&&lngEl&&latEl.value&&lngEl.value) choose(lat,lng);
    }).catch(e=>{ $('#mapPickerHint').textContent=e.message; });
  }
  function choose(lat,lng){
    selected={lat,lng}; if(marker)marker.remove();
    marker=L.marker([lat,lng]).addTo(map);
    $('#mapPickerCoords').textContent='Selected: '+lat.toFixed(6)+', '+lng.toFixed(6);
    $('#confirmMapLocation').disabled=false;
  }
  function closePicker(){ const modal=$('#mapPickerModal'); modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); activeTarget=null; selected=null; }
  $('#pickPickupOnMap')?.addEventListener('click',()=>openPicker('pickup'));
  $('#pickDropoffOnMap')?.addEventListener('click',()=>openPicker('dropoff'));
  $('#closeMapPicker')?.addEventListener('click',closePicker);
  $('#mapPickerModal')?.addEventListener('click',e=>{if(e.target.id==='mapPickerModal')closePicker();});
  $('#confirmMapLocation')?.addEventListener('click',()=>{if(!selected||!activeTarget)return;setFields(activeTarget,selected.lat,selected.lng);closePicker();});
  window.setMapCustomerRole=role=>{window.currentRoleForMap=role;};
  document.addEventListener('click',e=>{ if(e.target.closest('[data-go="customer"]')) setTimeout(()=>window.setMapCustomerRole(window.currentRole||null),0); });
})();
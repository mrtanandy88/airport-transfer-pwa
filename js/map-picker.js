(() => {
  let leafletPromise=null, map=null, marker=null, activeTarget=null, selected=null;
  const $=s=>document.querySelector(s);

  function loadLeaflet(){
    if(leafletPromise) return leafletPromise;
    leafletPromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link');
      css.rel='stylesheet';
      css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      const script=document.createElement('script');
      script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload=()=>resolve();
      script.onerror=()=>reject(new Error('Could not load the map. Please check your internet connection.'));
      document.head.appendChild(script);
    });
    return leafletPromise;
  }

  function setFields(target,lat,lng){
    const latEl=$('#bookingForm input[name="'+target+'Lat"]');
    const lngEl=$('#bookingForm input[name="'+target+'Lng"]');
    if(latEl)latEl.value=lat.toFixed(6);
    if(lngEl)lngEl.value=lng.toFixed(6);
  }

  async function reverseGeocode(lat,lng){
    const url='https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+
      encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lng)+'&localityLanguage=en';
    const response=await fetch(url);
    if(!response.ok) throw new Error('Address lookup failed');
    const data=await response.json();
    const parts=[
      data.locality,
      data.city,
      data.principalSubdivision,
      data.countryName
    ].filter((value,index,array)=>value && array.indexOf(value)===index);
    return parts.join(', ');
  }

  async function saveSelectedLocation(){
    if(!selected||!activeTarget)return;
    const target=activeTarget;
    const lat=selected.lat, lng=selected.lng;
    setFields(target,lat,lng);

    const input=$('#bookingForm input[name="'+target+'"]');
    const status=target==='pickup'?$('#pickupLocationStatus'):$('#mapPickerHint');
    if(status)status.textContent='✓ Pin saved. Looking up address…';

    try{
      const address=await reverseGeocode(lat,lng);
      if(input && address){
        input.value=address;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        setFields(target,lat,lng);
      }
      if(status)status.textContent=address
        ? '✓ Map pin and address saved.'
        : '✓ Map pin saved. You can edit the address above.';
    }catch(error){
      if(status)status.textContent='✓ Map pin saved. You can edit the address above.';
    }
    closePicker();
  }

  function openPicker(target){
    activeTarget=target;
    selected=null;
    const modal=$('#mapPickerModal');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    $('#mapPickerTitle').textContent=target==='pickup'?'Pick pickup location':'Pick drop-off location';
    $('#mapPickerHint').textContent=target==='pickup'
      ?'Tap the map where the customer should be picked up.'
      :'Tap the map where the customer should be dropped off.';
    $('#mapPickerCoords').textContent='No location selected.';
    $('#confirmMapLocation').disabled=true;

    loadLeaflet().then(()=>{
      const latEl=$('#bookingForm input[name="'+target+'Lat"]');
      const lngEl=$('#bookingForm input[name="'+target+'Lng"]');
      const lat=latEl&&latEl.value?Number(latEl.value):2.7456;
      const lng=lngEl&&lngEl.value?Number(lngEl.value):101.7072;

      if(!map){
        map=L.map('mapPicker').setView([lat,lng],13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
          maxZoom:19,
          attribution:'© OpenStreetMap contributors'
        }).addTo(map);
        map.on('click',e=>choose(e.latlng.lat,e.latlng.lng));
      }else{
        map.invalidateSize();
        map.setView([lat,lng],13);
      }

      if(latEl&&lngEl&&latEl.value&&lngEl.value)choose(lat,lng);
    }).catch(e=>{
      $('#mapPickerHint').textContent=e.message;
    });
  }

  function choose(lat,lng){
    selected={lat,lng};
    if(marker)marker.remove();
    marker=L.marker([lat,lng]).addTo(map);
    $('#mapPickerCoords').textContent='Selected: '+lat.toFixed(6)+', '+lng.toFixed(6);
    $('#confirmMapLocation').disabled=false;
  }

  function closePicker(){
    const modal=$('#mapPickerModal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    activeTarget=null;
    selected=null;
  }

  $('#pickPickupOnMap')?.addEventListener('click',()=>openPicker('pickup'));
  $('#pickDropoffOnMap')?.addEventListener('click',()=>openPicker('dropoff'));
  $('#closeMapPicker')?.addEventListener('click',closePicker);
  $('#mapPickerModal')?.addEventListener('click',e=>{
    if(e.target.id==='mapPickerModal')closePicker();
  });
  $('#confirmMapLocation')?.addEventListener('click',saveSelectedLocation);
})();

import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const KEY = 'airportTransferBookingsV5';
const SKEY = 'airportTransferSchedulesV3';
const VEHICLES = ['Sedan', 'SUV', 'MPV'];
const LANGUAGES = ['English', 'Malay', 'Mandarin', 'Cantonese', 'Tamil'];
const ADMIN_WHATSAPP = '60173858996';
const TRIP_STATUSES = ['Accepted','OnTheWay','ArrivedPickup','PickedUp','ArrivedDestination','DroppedOff','Completed'];
const TRIP_STATUS_LABELS = {Accepted:'Accepted',OnTheWay:'Driver On The Way',ArrivedPickup:'Arrived At Pickup',PickedUp:'Customer Picked Up',ArrivedDestination:'Arrived At Destination',DroppedOff:'Customer Dropped Off',Completed:'Completed'};
const TRIP_STATUS_ICONS = {Accepted:'✅',OnTheWay:'🚗',ArrivedPickup:'📍',PickedUp:'👤',ArrivedDestination:'🏁',DroppedOff:'🛬',Completed:'🎉'};
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let bookings = [], schedules = [], driverProfile = null, driverPublicProfile = null;
let currentUser = null, currentRole = null, db = null, auth = null, firebaseReady = false;
let filter = 'All', stopCloudListeners = [], driverAvailable = [], driverAccepted = [];
const publicProfileCache = new Map();
const tripStatusInFlight = new Set();

async function initFirebase() {
  if (!firebaseConfigured) {
    $('#modeNotice').textContent = 'Demo mode: Firebase is not configured.';
    updateAuthUI(); render(); return;
  }
  try {
    const app = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');
    const am = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');
    const fs = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js');
    const fbApp = app.initializeApp(firebaseConfig);
    auth = am.getAuth(fbApp); db = fs.getFirestore(fbApp);
    window.FB = { ...am, ...fs }; firebaseReady = true;
    $('#modeNotice').textContent = 'Firebase connected. Matching checks vehicle, language, private schedule and booking time.';
    am.onAuthStateChanged(auth, async user => {
      stopListeners(); currentUser = user; currentRole = null; driverProfile = null; driverPublicProfile = null;
      bookings = []; schedules = []; driverAvailable = []; driverAccepted = [];
      if (user) {
        try {
          const snap = await fs.getDoc(fs.doc(db, 'users', user.uid));
          currentRole = snap.exists() ? snap.data().role : null;
          if (!['customer', 'driver', 'admin'].includes(currentRole)) {
            await am.signOut(auth); alert('Your account has no valid app role.'); return;
          }
          driverProfile = snap.exists() ? snap.data() : null;
          if (currentRole === 'driver') {
            const pub = await fs.getDoc(fs.doc(db, 'driverPublicProfiles', user.uid));
            driverPublicProfile = pub.exists() ? pub.data() : null;
            loadDriverProfileUI();
          }
          startCloudListeners();
        } catch (e) {
          console.error(e); alert('Could not load your account profile: ' + e.message); await am.signOut(auth); return;
        }
      }
      updateAuthUI(); render();
    });
  } catch (e) {
    console.error(e); firebaseReady = false; $('#modeNotice').textContent = 'Firebase could not start: ' + e.message; updateAuthUI(); render();
  }
}
function stopListeners() { stopCloudListeners.forEach(stop => { try { stop(); } catch (_) {} }); stopCloudListeners = []; }
function mergeDocs(snap) { return snap.docs.map(d => ({ docId: d.id, ...d.data() })); }
function startCloudListeners() {
  if (!firebaseReady || !currentUser || !currentRole) return;
  const F = window.FB;
  if (currentRole === 'customer') {
    const q = F.query(F.collection(db, 'bookings'), F.where('customerUid', '==', currentUser.uid));
    stopCloudListeners.push(F.onSnapshot(q, snap => { bookings = mergeDocs(snap); render(); }, handleCloudError));
  }
  if (currentRole === 'driver') {
    const availableQ = F.query(F.collection(db, 'bookings'), F.where('status', '==', 'Available'));
    const acceptedQ = F.query(F.collection(db, 'bookings'), F.where('driverUid', '==', currentUser.uid));
    stopCloudListeners.push(F.onSnapshot(availableQ, snap => { rebuildDriverBookings(mergeDocs(snap), null); }, handleCloudError));
    stopCloudListeners.push(F.onSnapshot(acceptedQ, snap => { rebuildDriverBookings(null, mergeDocs(snap)); }, handleCloudError));
    const scheduleQ = F.query(F.collection(db, 'driverSchedules'), F.where('driverUid', '==', currentUser.uid));
    stopCloudListeners.push(F.onSnapshot(scheduleQ, snap => { schedules = mergeDocs(snap); renderSchedules(); renderJobs(); cleanupDuplicateSchedules(schedules); }, handleCloudError));
  }
  if (currentRole === 'admin') stopCloudListeners.push(F.onSnapshot(F.collection(db, 'bookings'), snap => { bookings = mergeDocs(snap); render(); }, handleCloudError));
}
function rebuildDriverBookings(available, accepted) {
  if (available) driverAvailable = available; if (accepted) driverAccepted = accepted;
  const map = new Map(); [...driverAvailable, ...driverAccepted].forEach(b => map.set(b.docId, b)); bookings = [...map.values()]; render();
}
function handleCloudError(error) {
  console.error(error); const code = error?.code || 'unknown';
  $('#modeNotice').textContent = code === 'permission-denied' ? 'Firebase denied this action. Check the user role and published Firestore rules.' : 'Firebase error (' + code + '): ' + (error?.message || 'Unknown error');
}
function show(id) { $$('.screen').forEach(x => x.classList.remove('active')); $('#' + id).classList.add('active'); render(); updateAuthUI(); }
$$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
function updateAuthUI() {
  if(window.setMapCustomerRole) window.setMapCustomerRole(currentRole);

  const signed = !!currentUser;
  if (!firebaseReady) {
    $('#customerAuth').classList.add('hidden'); $('#bookingForm').classList.remove('hidden'); $('#driverAuth').classList.add('hidden'); $('#driverArea').classList.remove('hidden'); $('#adminAuth').classList.add('hidden'); $('#adminArea').classList.remove('hidden'); return;
  }
  $('#customerAuth').classList.toggle('hidden', signed && currentRole === 'customer'); $('#bookingForm').classList.toggle('hidden', !(signed && currentRole === 'customer') || bookings.length > 0); $('#customerLogout').classList.toggle('hidden', !(signed && currentRole === 'customer'));
  $('#driverAuth').classList.toggle('hidden', signed && currentRole === 'driver'); $('#driverArea').classList.toggle('hidden', !(signed && currentRole === 'driver')); $('#driverLogout').classList.toggle('hidden', !(signed && currentRole === 'driver'));
  $('#adminAuth').classList.toggle('hidden', signed && currentRole === 'admin'); $('#adminArea').classList.toggle('hidden', !(signed && currentRole === 'admin'));
}
function selectedLanguages() { return [...$('#driverLanguages').selectedOptions].map(o => o.value); }
function selectedProfileLanguages() { return [...$('#driverLanguagesProfile').selectedOptions].map(o => o.value); }
function setSelected(select, values) { const list = Array.isArray(values) ? values : []; [...select.options].forEach(o => { o.selected = list.includes(o.value); }); }
function loadDriverProfileUI() {
  const p = driverPublicProfile || driverProfile || {};
  $('#driverNameProfile').value = p.displayName || '';
  $('#driverVehicleProfile').value = p.vehicleType || '';
  $('#driverCarModelProfile').value = p.carModel || '';
  $('#driverCarColorProfile').value = p.carColor || '';
  $('#driverPlateProfile').value = p.plateNumber || '';
  $('#driverWhatsAppProfile').value = p.whatsappNumber || '';
  setSelected($('#driverLanguagesProfile'), p.languages || driverProfile?.languages || []);
  renderDriverPhotoPreview(p);
}
function renderDriverPhotoPreview(p) {
  const items = [];
  if (p.selfieDataUrl) items.push(`<div><img src="${p.selfieDataUrl}" alt="Driver selfie"><small>Driver photo</small></div>`);
  if (p.carPhotoDataUrl) items.push(`<div><img src="${p.carPhotoDataUrl}" alt="Driver car"><small>Vehicle photo</small></div>`);
  $('#driverPhotoPreview').innerHTML = items.length ? items.join('') : '<p class="muted">No driver photos uploaded yet.</p>';
}
function normalizePlate(v) { return String(v || '').trim().toUpperCase(); }
function validPlate(v) { return normalizePlate(v).length >= 2; }
function validCarModel(v) { return String(v || '').trim().length >= 2 && String(v || '').trim().length <= 60; }
function validCarColor(v) { return String(v || '').trim().length >= 2 && String(v || '').trim().length <= 30; }
async function compressImage(file, maxDimension = 1000, maxBytes = 220000) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d'); ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  for (const quality of [0.78, 0.68, 0.58, 0.48, 0.38]) {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) continue;
    if (blob.size <= maxBytes) return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Could not read compressed image.')); reader.readAsDataURL(blob); });
  }
  throw new Error('Image is still too large after compression. Please choose a smaller photo.');
}
async function signUp(role, email, password) {
  if (!firebaseReady) return alert('Firebase is not connected.');
  email = (email || '').trim(); if (!email || !password) return alert('Enter email and password.'); if (password.length < 6) return alert('Password must be at least 6 characters.');
  try {
    if (role !== 'driver') { const result = await window.FB.createUserWithEmailAndPassword(auth, email, password); await window.FB.setDoc(window.FB.doc(db, 'users', result.user.uid), { email, role, createdAt: window.FB.serverTimestamp() }); alert('Customer account created.'); return; }
    const displayName = $('#driverName').value.trim(), vehicleType = $('#driverVehicle').value, carModel = $('#driverCarModel').value.trim(), carColor = $('#driverCarColor').value.trim(), plateNumber = normalizePlate($('#driverPlate').value), whatsappNumber = normalizeWhatsAppNumber($('#driverWhatsApp').value);
    const selfieFile = $('#driverSelfie').files[0], carFile = $('#driverCarPhoto').files[0];
    if (!displayName) return alert('Please enter your driver name.'); if (!VEHICLES.includes(vehicleType)) return alert('Please select your vehicle.'); if (!validCarModel(carModel)) return alert('Please enter your car model.'); if (!validCarColor(carColor)) return alert('Please enter your car color.'); if (!validPlate(plateNumber)) return alert('Please enter your car plate number.'); if (!whatsappNumber) return alert('Please enter your WhatsApp number in international format, e.g. 60123456789.'); if (!selfieFile || !carFile) return alert('Please upload both your selfie and car photo.');
    const [selfieDataUrl, carPhotoDataUrl] = await Promise.all([compressImage(selfieFile, 700, 220000), compressImage(carFile, 1000, 220000)]);
    const result = await window.FB.createUserWithEmailAndPassword(auth, email, password);
    const languages = selectedLanguages();
    await window.FB.setDoc(window.FB.doc(db, 'users', result.user.uid), { email, role, displayName, vehicleType, carModel, carColor, plateNumber, whatsappNumber, languages, createdAt: window.FB.serverTimestamp() });
    await window.FB.setDoc(window.FB.doc(db, 'driverPublicProfiles', result.user.uid), { driverUid: result.user.uid, displayName, vehicleType, carModel, carColor, plateNumber, whatsappNumber, languages, selfieDataUrl, carPhotoDataUrl, updatedAt: window.FB.serverTimestamp() });
    alert('Driver account created. Your profile is ready for customer verification.');
  } catch (e) { console.error(e); alert(e.message); }
}
async function signIn(expectedRole, email, password) {
  if (!firebaseReady) return alert('Firebase is not connected.'); email = (email || '').trim(); if (!email || !password) return alert('Enter email and password.');
  try { const result = await window.FB.signInWithEmailAndPassword(auth, email, password); const snap = await window.FB.getDoc(window.FB.doc(db, 'users', result.user.uid)); const actualRole = snap.exists() ? snap.data().role : null; if (actualRole !== expectedRole) { await window.FB.signOut(auth); alert(`This account is registered as ${actualRole || 'unknown'}, not ${expectedRole}.`); } }
  catch (e) { alert(e.message); }
}
async function saveDriverProfile() {
  if (!currentUser || currentRole !== 'driver') return alert('Please sign in as a driver first.');
  const displayName = $('#driverNameProfile').value.trim(), vehicleType = $('#driverVehicleProfile').value, carModel = $('#driverCarModelProfile').value.trim(), carColor = $('#driverCarColorProfile').value.trim(), plateNumber = normalizePlate($('#driverPlateProfile').value), whatsappNumber = normalizeWhatsAppNumber($('#driverWhatsAppProfile').value);
  if (!displayName) return alert('Please enter your driver name.'); if (!VEHICLES.includes(vehicleType)) return alert('Please select your vehicle.'); if (!validCarModel(carModel)) return alert('Please enter your car model.'); if (!validCarColor(carColor)) return alert('Please enter your car color.'); if (!validPlate(plateNumber)) return alert('Please enter your car plate number.'); if (!whatsappNumber) return alert('Please enter your WhatsApp number in international format, e.g. 60123456789.');
  const button = $('#saveDriverProfile'); button.disabled = true; button.textContent = 'Saving...'; $('#driverProfileMessage').textContent = '';
  try {
    let selfieDataUrl = driverPublicProfile?.selfieDataUrl || '', carPhotoDataUrl = driverPublicProfile?.carPhotoDataUrl || '';
    const selfieFile = $('#driverSelfieProfile').files[0], carFile = $('#driverCarPhotoProfile').files[0];
    if (selfieFile) selfieDataUrl = await compressImage(selfieFile, 700, 220000);
    if (carFile) carPhotoDataUrl = await compressImage(carFile, 1000, 220000);
    if (!selfieDataUrl || !carPhotoDataUrl) return alert('Please upload both your selfie and car photo before saving your profile.');
    const languages = selectedProfileLanguages();
    try {
      await window.FB.setDoc(window.FB.doc(db, 'users', currentUser.uid), { displayName, vehicleType, carModel, carColor, plateNumber, whatsappNumber, languages }, { merge: true });
    } catch (e) {
      console.error('Driver users profile save failed:', e);
      throw new Error('users profile save failed (' + (e.code || 'error') + '): ' + e.message);
    }
    try {
      await window.FB.setDoc(window.FB.doc(db, 'driverPublicProfiles', currentUser.uid), { driverUid: currentUser.uid, displayName, vehicleType, carModel, carColor, plateNumber, whatsappNumber, languages, selfieDataUrl, carPhotoDataUrl, updatedAt: window.FB.serverTimestamp() }, { merge: true });
    } catch (e) {
      console.error('Driver public profile save failed:', e);
      throw new Error('driverPublicProfiles save failed (' + (e.code || 'error') + '): ' + e.message);
    }
    driverProfile = { ...(driverProfile || {}), displayName, vehicleType, carModel, carColor, plateNumber, whatsappNumber, languages }; driverPublicProfile = { ...(driverPublicProfile || {}), displayName, vehicleType, carModel, carColor, plateNumber, whatsappNumber, languages, selfieDataUrl, carPhotoDataUrl };
    $('#driverSelfieProfile').value = ''; $('#driverCarPhotoProfile').value = ''; renderDriverPhotoPreview(driverPublicProfile); renderJobs();
    $('#driverProfileMessage').textContent = '✓ Driver profile saved. Customers will see your name, vehicle, model, color, plate and photos after assignment.';
  } catch (e) { $('#driverProfileMessage').textContent = '✕ Save failed: ' + (e.code || 'error') + ' — ' + e.message; }
  finally { button.disabled = false; button.textContent = 'Save driver profile'; }
}
async function logout() { if (firebaseReady && auth) await window.FB.signOut(auth); stopListeners(); currentUser = null; currentRole = null; driverProfile = null; driverPublicProfile = null; bookings = []; schedules = []; driverAvailable = []; driverAccepted = []; updateAuthUI(); render(); }
$('#customerSignup').onclick = () => signUp('customer', $('#customerEmail').value, $('#customerPassword').value);
$('#customerLogin').onclick = () => signIn('customer', $('#customerEmail').value, $('#customerPassword').value);
$('#driverSignup').onclick = () => signUp('driver', $('#driverEmail').value, $('#driverPassword').value);
$('#driverLogin').onclick = () => signIn('driver', $('#driverEmail').value, $('#driverPassword').value);
$('#adminLogin').onclick = () => signIn('admin', $('#adminEmail').value, $('#adminPassword').value);
$('#customerLogout').onclick = logout; $('#driverLogout').onclick = logout; $('#saveDriverProfile').onclick = saveDriverProfile;
async function addBooking(booking) {
  if (firebaseReady) { if (!currentUser || currentRole !== 'customer') throw new Error('Please sign in as a customer.'); await window.FB.addDoc(window.FB.collection(db, 'bookings'), { ...booking, customerUid: currentUser.uid, createdAt: window.FB.serverTimestamp() }); }
  else { bookings.unshift(booking); localStorage.setItem(KEY, JSON.stringify(bookings)); render(); }
}
$('#bookingForm').addEventListener('submit', async e => {
  e.preventDefault(); const f = new FormData(e.target), vehicleType = f.get('vehicleType'); if (!VEHICLES.includes(vehicleType)) return alert('Please select a preferred vehicle.');
  const bookingDate = String(f.get('date') || ''), bookingTime = String(f.get('time') || ''), now = new Date(), selectedDateTime = bookingDate && bookingTime ? new Date(bookingDate + 'T' + bookingTime) : null;
  if (!bookingDate || !bookingTime || !selectedDateTime || Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= now) return alert('Please choose a future transfer date and time.');
  const flightDate = String(f.get('flightDate') || ''), flightTime = String(f.get('flightTime') || '');
  if ((flightDate && !flightTime) || (!flightDate && flightTime)) return alert('Please enter both the flight date and flight time, or leave both blank.');
  const adults = Math.max(1, Number(f.get('adults') || 0)), children = Math.max(0, Number(f.get('children') || 0));
  const largeLuggage = Math.max(0, Number(f.get('largeLuggage') || 0)), mediumLuggage = Math.max(0, Number(f.get('mediumLuggage') || 0)), smallLuggage = Math.max(0, Number(f.get('smallLuggage') || 0)), handCarry = Math.max(0, Number(f.get('handCarry') || 0));
  const passengers = adults + children, checkedLuggage = largeLuggage + mediumLuggage + smallLuggage, luggage = checkedLuggage + handCarry;
  const booking = { id: 'AT-' + Date.now().toString().slice(-6), name: f.get('name'), phone: f.get('phone'), pickup: String(f.get('pickup') || '').trim(), destination: String(f.get('destination') || '').trim(), pickupLat: f.get('pickupLat') ? Number(f.get('pickupLat')) : null, pickupLng: f.get('pickupLng') ? Number(f.get('pickupLng')) : null, dropoffLat: f.get('dropoffLat') ? Number(f.get('dropoffLat')) : null, dropoffLng: f.get('dropoffLng') ? Number(f.get('dropoffLng')) : null, date: bookingDate, time: bookingTime, adults, children, passengers, largeLuggage, mediumLuggage, smallLuggage, handCarry, checkedLuggage, luggage, flightType: f.get('flightType') || '', flightNumber: String(f.get('flightNumber') || '').trim().toUpperCase(), flightDate: f.get('flightDate') || '', flightTime: f.get('flightTime') || '', terminal: String(f.get('terminal') || '').trim(), meetInstructions: String(f.get('meetInstructions') || '').trim(), language: f.get('language'), vehicleType, status: 'Available', tripStatus: 'AwaitingDriver', driver: '', driverUid: '', driverWhatsApp: '' };
  try { await addBooking(booking); e.target.reset(); $('#customerResult').innerHTML = `<div class="booking success"><h3>Booking placed ✓</h3><p>Your booking ID is <b>${escapeHtml(booking.id)}</b>.</p><p>Vehicle: <b>${escapeHtml(booking.vehicleType)}</b></p><span class="badge">Available</span></div>`; } catch (err) { alert('Could not save booking: ' + err.message); }
});
function parseDateParts(value) {
  const [y,m,d] = String(value || '').split('-').map(Number);
  return Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d) ? {y,m,d} : null;
}
function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + 'th';
  return n + ({1:'st',2:'nd',3:'rd'}[n % 10] || 'th');
}
function formatDate(value) {
  const p = parseDateParts(value);
  if (!p) return String(value || '');
  const dt = new Date(p.y, p.m - 1, p.d);
  const weekday = dt.toLocaleDateString('en-MY', {weekday:'long'});
  const month = dt.toLocaleDateString('en-MY', {month:'long'});
  return ordinal(p.d) + ' ' + month + ' ' + p.y + ' (' + weekday + ')';
}
function formatTime(value) {
  const [h,m] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return String(value || '');
  const dt = new Date(2000,0,1,h,m);
  return dt.toLocaleTimeString('en-MY', {hour:'numeric', minute:'2-digit', hour12:true}).replace(' ', ' ');
}
function formatDateTime(date, time) {
  const d = formatDate(date), t = formatTime(time);
  return d && t ? d + ' • ' + t : d || t;
}
function mapsQuery(value){ return encodeURIComponent(String(value || '').trim()); }
function mapsSearchUrl(address, lat, lng){ const query = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? String(lat)+','+String(lng) : String(address || '').trim(); return 'https://www.google.com/maps/search/?api=1&query='+mapsQuery(query); }
function mapsNavigateUrl(address, lat, lng){ const destination = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? String(lat)+','+String(lng) : String(address || '').trim(); return 'https://www.google.com/maps/dir/?api=1&destination='+mapsQuery(destination)+'&travelmode=driving&dir_action=navigate'; }
function locationLinks(b, driverMode=false){
  const pickupNav=mapsNavigateUrl(b.pickup,b.pickupLat,b.pickupLng), dropNav=mapsNavigateUrl(b.destination,b.dropoffLat,b.dropoffLng);
  return '<div class="location-details"><div class="location-block"><b>📍 PICKUP LOCATION</b><span>'+escapeHtml(b.pickup||'Not provided')+'</span><div class="location-actions"><a href="'+pickupNav+'" target="_blank" rel="noopener" class="map-button">🚗 '+(driverMode?'Navigate to pickup':'Open pickup in Google Maps')+'</a><a href="'+mapsSearchUrl(b.pickup,b.pickupLat,b.pickupLng)+'" target="_blank" rel="noopener" class="map-link">View map</a></div></div><div class="location-block"><b>🛬 DROP-OFF LOCATION</b><span>'+escapeHtml(b.destination||'Not provided')+'</span><div class="location-actions"><a href="'+dropNav+'" target="_blank" rel="noopener" class="map-button">🚗 '+(driverMode?'Navigate to drop-off':'Open drop-off in Google Maps')+'</a><a href="'+mapsSearchUrl(b.destination,b.dropoffLat,b.dropoffLng)+'" target="_blank" rel="noopener" class="map-link">View map</a></div></div>'+(b.pickupLat!=null&&b.pickupLng!=null?'<small class="location-precision">📌 Pickup pin saved for more precise navigation.</small>':'')+'</div>';
}
function todayISO() {
  const d = new Date();
  const pad = n => String(n).padStart(2,'0');
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
}
function setDateLimits() {
  const today = todayISO();
  ['#bookingForm input[name="date"]','#bookingForm input[name="flightDate"]','#unavailableDate'].forEach(sel => {
    const el = $(sel);
    if (el) el.min = today;
  });
}
function updateDateTimePreview() {
  const date = $('#bookingForm input[name="date"]')?.value || '';
  const time = $('#bookingForm input[name="time"]')?.value || '';
  const out = $('#bookingDateTimePreview');
  if (out) out.textContent = date || time ? 'Schedule: ' + formatDateTime(date, time) : 'Schedule: Please select the transfer date and time.';
  const flightDate = $('#bookingForm input[name="flightDate"]')?.value || '';
  const flightTime = $('#bookingForm input[name="flightTime"]')?.value || '';
  const flightOut = $('#flightDateTimePreview');
  if (flightOut) flightOut.textContent = flightDate || flightTime ? 'Flight schedule: ' + formatDateTime(flightDate, flightTime) : 'Flight schedule: Optional';
}
function updateUnavailablePreview() {
  const date = $('#unavailableDate')?.value || '';
  const from = $('#unavailableFrom')?.value || '';
  const to = $('#unavailableTo')?.value || '';
  const out = $('#unavailablePreview');
  if (out) out.textContent = date && from && to ? 'Unavailable: ' + formatDateTime(date, from) + ' → ' + formatTime(to) : 'Unavailable: Select date, From and To times.';
}
function timeToMinutes(t) { const [h,m] = String(t || '').split(':').map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h*60+m : -1; }
function overlapsSchedule(booking, schedule) { if (!schedule || schedule.date !== booking.date) return false; const bt=timeToMinutes(booking.time), from=timeToMinutes(schedule.from), to=timeToMinutes(schedule.to); return bt>=from && bt<to; }
function languageMatches(booking) { if (!booking.language || booking.language === 'Any') return true; const languages=Array.isArray(driverProfile?.languages)?driverProfile.languages:[]; return !languages.length || languages.includes(booking.language); }
function vehicleMatches(booking) { return VEHICLES.includes(booking.vehicleType) && driverProfile?.vehicleType === booking.vehicleType; }
function hasAcceptedConflict(booking) { return driverAccepted.some(b => b.status === 'Accepted' && b.date === booking.date && Math.abs(timeToMinutes(b.time)-timeToMinutes(booking.time))<120); }
function matchReasons(booking) { return [`vehicle: ${booking.vehicleType}`, booking.language && booking.language!=='Any'?'language match':'language flexible', 'schedule clear', 'no nearby accepted job']; }
function canDriverTake(booking) { return vehicleMatches(booking) && languageMatches(booking) && !schedules.some(s=>overlapsSchedule(booking,s)) && !hasAcceptedConflict(booking); }
async function acceptJob(id) {
  const booking=bookings.find(x=>x.docId===id||x.id===id); if(!booking||!currentUser||currentRole!=='driver') return alert('Please sign in as a driver first.');
  if(!driverProfile?.vehicleType||!validPlate(driverProfile?.plateNumber)||!validCarModel(driverProfile?.carModel)||!validCarColor(driverProfile?.carColor)) return alert('Please complete your driver profile, including vehicle, car model, car color and plate number.');
  if(booking.status!=='Available') return alert('This job has already been taken.'); if(!canDriverTake(booking)) return alert('This job no longer matches your vehicle, language, private schedule or existing job schedule.');
  try { await window.FB.updateDoc(window.FB.doc(db,'bookings',booking.docId), { status:'Accepted', tripStatus:'Accepted', tripStatusUpdatedAt:window.FB.serverTimestamp(), driver:driverProfile.displayName||currentUser.email, driverUid:currentUser.uid, driverWhatsApp:driverProfile.whatsappNumber||currentUser.phoneNumber||'', driverVehicleType:driverProfile.vehicleType, driverCarModel:driverProfile.carModel, driverCarColor:driverProfile.carColor, driverPlateNumber:driverProfile.plateNumber, acceptedAt:window.FB.serverTimestamp() }); alert('Job accepted. The customer can now see your driver, vehicle details and live trip status.'); }
  catch(e){ alert('Could not accept job ('+(e.code||'error')+'): '+e.message); }
}
window.acceptJob=acceptJob;
function normalizeWhatsAppNumber(value){ return String(value||'').replace(/\D/g,''); }
function whatsappUrl(number,message=''){ const n=normalizeWhatsAppNumber(number); return 'https://wa.me/'+n+(message?'?text='+encodeURIComponent(message):''); }
function bookingWhatsAppMessage(b,mode='support'){
  const lines=[mode==='group'?'Airport Transfer WhatsApp Group Setup':'Airport Transfer Customer Service','',
    'Booking: '+(b.id||''),'Customer: '+(b.name||'')+' • '+(b.phone||''),'Pickup: '+(b.pickup||''),'Destination: '+(b.destination||''),'Trip: '+formatDateTime(b.date,b.time),
    'Vehicle: '+(b.vehicleType||''),'Preferred language: '+(b.language||'Any'),'Trip status: '+(TRIP_STATUS_LABELS[b.tripStatus]||'Awaiting driver'),
    'Driver: '+(b.driver||'Not assigned'),'Driver WhatsApp: '+(b.driverWhatsApp||'Not provided'),'Customer WhatsApp: '+(b.phone||''),'',
    mode==='group'?'Please create a WhatsApp group for this transfer and add the customer, driver and admin.':'Please assist with this airport transfer booking.'];
  return lines.join('\n');
}
function adminWhatsAppLink(b,mode='support'){ return whatsappUrl(ADMIN_WHATSAPP,bookingWhatsAppMessage(b,mode)); }
function formatTimestamp(value){
  try{ const d=value?.toDate?value.toDate():(value instanceof Date?value:new Date(value)); if(Number.isNaN(d.getTime())) return ''; return d.toLocaleString('en-MY',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}); }catch(_){ return ''; }
}
function renderTripStatus(b,driverMode=false){
  if(b.status==='Available') return '<div class="trip-status"><div class="trip-status-header"><b>LIVE TRIP STATUS</b><span class="trip-status-current">🕐 Waiting for driver</span></div><p class="muted">Your booking is available for a matching driver.</p></div>';
  const current=TRIP_STATUSES.includes(b.tripStatus)?b.tripStatus:(b.status==='Completed'?'Completed':b.status==='Accepted'?'Accepted':'Accepted');
  const currentIndex=TRIP_STATUSES.indexOf(current);
  const fields={Accepted:'acceptedAt',OnTheWay:'onTheWayAt',ArrivedPickup:'arrivedPickupAt',PickedUp:'pickedUpAt',ArrivedDestination:'arrivedDestinationAt',DroppedOff:'droppedOffAt',Completed:'completedAt'};
  const timeline=TRIP_STATUSES.map((key,i)=>{ const done=i<=currentIndex,ts=b[fields[key]]; return '<div class="trip-status-step '+(done?'done ':'')+(key===current?'current':'')+'"><span class="trip-status-icon">'+TRIP_STATUS_ICONS[key]+'</span><div><strong>'+escapeHtml(TRIP_STATUS_LABELS[key])+'</strong>'+(ts?'<small>'+escapeHtml(formatTimestamp(ts))+'</small>':'')+'</div></div>'; }).join('');
  let actions='';
  if(driverMode&&b.status==='Accepted'&&current!=='Completed'){
    const next={Accepted:'OnTheWay',OnTheWay:'ArrivedPickup',ArrivedPickup:'PickedUp',PickedUp:'ArrivedDestination',ArrivedDestination:'DroppedOff',DroppedOff:'Completed'}[current];
    if(next) actions='<button class="trip-status-button" onclick="updateTripStatus(\''+escapeHtml(b.docId)+'\',\''+next+'\')">'+TRIP_STATUS_ICONS[next]+' '+escapeHtml(TRIP_STATUS_LABELS[next])+'</button>';
  }
  return '<div class="trip-status"><div class="trip-status-header"><b>LIVE TRIP STATUS</b><span class="trip-status-current">'+TRIP_STATUS_ICONS[current]+' '+escapeHtml(TRIP_STATUS_LABELS[current])+'</span></div><div class="trip-status-timeline">'+timeline+'</div>'+actions+'</div>';
}
async function updateTripStatus(id,nextStatus){
  const booking=bookings.find(x=>x.docId===id||x.id===id);
  if(!booking||!currentUser||currentRole!=='driver') return;

  const key=booking.docId;
  if(tripStatusInFlight.has(key)) return;
  tripStatusInFlight.add(key);

  const expectedMap={
    Accepted:'OnTheWay',
    OnTheWay:'ArrivedPickup',
    ArrivedPickup:'PickedUp',
    PickedUp:'ArrivedDestination',
    ArrivedDestination:'DroppedOff',
    DroppedOff:'Completed'
  };

  try{
    const ref=window.FB.doc(db,'bookings',booking.docId);

    // Read the latest Firestore document inside a transaction.
    // This prevents a second/stale tap from producing a misleading
    // permission-denied error after the first update already succeeded.
    const snap=await window.FB.getDoc(ref);
    if(!snap.exists()) throw new Error('Booking no longer exists.');

    const latest=snap.data();
    const current=TRIP_STATUSES.includes(latest.tripStatus)
      ? latest.tripStatus
      : (latest.status==='Completed'?'Completed':'Accepted');

    const expected=expectedMap[current];

    if(current===nextStatus){
      const fresh={docId:snap.id,...latest};
      bookings=bookings.map(x=>x.docId===fresh.docId?fresh:x);
      driverAccepted=driverAccepted.map(x=>x.docId===fresh.docId?fresh:x);
      renderJobs();
      return;
    }

    if(latest.driverUid!==currentUser.uid){
      const err=new Error('This booking is assigned to another driver.');
      err.code='booking-owner-mismatch';
      throw err;
    }

    if(expected!==nextStatus){
      const err=new Error('The trip is already at '+(TRIP_STATUS_LABELS[current]||current)+'.');
      err.code='trip-status-already-advanced';
      throw err;
    }

    const timestampField={
      OnTheWay:'onTheWayAt',
      ArrivedPickup:'arrivedPickupAt',
      PickedUp:'pickedUpAt',
      ArrivedDestination:'arrivedDestinationAt',
      DroppedOff:'droppedOffAt',
      Completed:'completedAt'
    }[nextStatus];

    const payload={
      tripStatus:nextStatus,
      tripStatusUpdatedAt:window.FB.serverTimestamp()
    };
    if(timestampField) payload[timestampField]=window.FB.serverTimestamp();
    if(nextStatus==='Completed') payload.status='Completed';

    await window.FB.updateDoc(ref,payload);

    const freshSnap=await window.FB.getDoc(ref);
    if(freshSnap.exists()){
      const fresh={docId:freshSnap.id,...freshSnap.data()};
      bookings=bookings.map(x=>x.docId===fresh.docId?fresh:x);
      driverAccepted=driverAccepted.map(x=>x.docId===fresh.docId?fresh:x);
      renderJobs();
    }

  }catch(e){
    console.error('Trip status update failed:',e);
    if(e.code==='trip-status-already-advanced'){
      renderJobs();
    }else{
      alert('Could not update trip status ('+(e.code||'error')+'): '+e.message+
        '\\n\\nDriver UID: '+(currentUser?.uid||'none')+
        '\\nBooking Driver UID: '+(booking?.driverUid||'none')+
        '\\nBooking Status: '+(booking?.status||'none')+
        '\\nTrip Status: '+(booking?.tripStatus||'none'));
    }
  }finally{
    tripStatusInFlight.delete(key);
  }
}
window.updateTripStatus=updateTripStatus;
async function addUnavailable() {
  const date=$('#unavailableDate').value, from=$('#unavailableFrom').value, to=$('#unavailableTo').value; if(!currentUser||currentRole!=='driver') return alert('Please sign in as a driver first.'); if(!date||!from||!to) return alert('Please select a date, From time and To time.'); if(from>=to) return alert('The To time must be later than the From time.');
  if(schedules.some(s=>s.date===date&&s.from===from&&s.to===to)){ $('#scheduleMessage').textContent='Already added — duplicate schedule prevented.'; return; }
  const schedule={date,from,to,driverUid:currentUser.uid}, button=$('#addUnavailable'); button.disabled=true; button.textContent='Saving...'; $('#scheduleMessage').textContent='';
  try { const safeId=encodeURIComponent(`${currentUser.uid}_${date}_${from}_${to}`), ref=window.FB.doc(db,'driverSchedules',safeId), existing=await window.FB.getDoc(ref); if(existing.exists()) throw new Error('That exact unavailable time already exists.'); await window.FB.setDoc(ref,{...schedule,createdAt:window.FB.serverTimestamp()}); $('#scheduleMessage').textContent='✓ Unavailable time saved. Duplicate entries are blocked.'; $('#unavailableDate').value=''; $('#unavailableFrom').value=''; $('#unavailableTo').value=''; }
  catch(e){ console.error(e); $('#scheduleMessage').textContent='✕ Save failed: '+(e.code||'error')+' — '+e.message; alert('Could not save unavailable time.\n\n'+(e.code||'error')+': '+e.message); }
  finally{ button.disabled=false; button.textContent='Add unavailable time'; }
}
$('#addUnavailable').onclick=addUnavailable;
async function cleanupDuplicateSchedules(list){ if(!firebaseReady||currentRole!=='driver'||!currentUser||list.length<2)return; const seen=new Map(),duplicates=[]; for(const s of list){const key=`${s.date}|${s.from}|${s.to}`; if(seen.has(key))duplicates.push(s.docId); else seen.set(key,s.docId);} if(!duplicates.length)return; try{await Promise.all(duplicates.map(id=>window.FB.deleteDoc(window.FB.doc(db,'driverSchedules',id)))); $('#scheduleMessage').textContent=`✓ Removed ${duplicates.length} duplicate schedule${duplicates.length===1?'':'s'}.`;}catch(e){console.error(e);} }
async function deleteSchedule(id){if(!currentUser||currentRole!=='driver')return;if(!confirm('Remove this unavailable time?'))return;try{await window.FB.deleteDoc(window.FB.doc(db,'driverSchedules',id));}catch(e){alert('Could not remove schedule: '+e.message);}}
window.deleteSchedule=deleteSchedule;
function renderSchedules(){ $('#scheduleList').innerHTML=schedules.length?schedules.sort((a,b)=>`${a.date}${a.from}`.localeCompare(`${b.date}${b.from}`)).map(s=>`<div class="schedule"><b>${escapeHtml(formatDate(s.date))}</b><span>${escapeHtml(formatTime(s.from))} – ${escapeHtml(formatTime(s.to))} <button class="mini-delete" onclick="deleteSchedule('${escapeHtml(s.docId)}')" type="button">×</button></span></div>`).join(''):'<p class="muted">No unavailable times added.</p>'; }
function renderJobs(){
  if(currentRole!=='driver'){ $('#driverJobs').innerHTML=''; return; }
  const accepted=driverAccepted.filter(b=>b.status==='Accepted').sort((a,b)=>String(a.date+a.time).localeCompare(String(b.date+b.time)));
  const available=driverAvailable.filter(b=>b.status==='Available'&&canDriverTake(b)).sort((a,b)=>String(a.date+a.time).localeCompare(String(b.date+b.time)));
  const flightDetails=b=>(b.flightNumber||b.flightType||b.terminal||b.meetInstructions)?`<div class="driver-flight-details"><h4>✈️ FLIGHT DETAILS</h4>${b.flightType?`<div>Trip: ${escapeHtml(b.flightType)}</div>`:''}${b.flightNumber?`<div>Flight: <b>${escapeHtml(b.flightNumber)}</b></div>`:''}${b.flightDate||b.flightTime?`<div>Flight schedule: ${escapeHtml(formatDateTime(b.flightDate,b.flightTime))}</div>`:''}${b.terminal?`<div>Terminal: ${escapeHtml(b.terminal)}</div>`:''}${b.meetInstructions?`<div>Meet: ${escapeHtml(b.meetInstructions)}</div>`:''}</div>`:'';
  const card=b=>{ const isAccepted=b.status==='Accepted'; return `<div class="booking driver-job-card ${isAccepted?'accepted-job':''}">${isAccepted?'<div class="job-status-row"><span class="badge">ACCEPTED</span></div>':''}<div class="driver-job-route"><h3>${escapeHtml(b.pickup)} → ${escapeHtml(b.destination)}</h3></div><div class="driver-trip-schedule"><div class="driver-schedule-label">🗓 TRIP SCHEDULE</div><div class="driver-schedule-date">${escapeHtml(formatDate(b.date))}</div><div class="driver-schedule-time">${escapeHtml(formatTime(b.time))}</div></div><div class="driver-job-info"><div>👤 <b>${escapeHtml(String(b.passengers))}</b> passenger${Number(b.passengers)===1?'':'s'}</div><div>🧳 <b>${escapeHtml(String(b.luggage ?? 0))}</b> luggage</div><div>🚗 <b>${escapeHtml(b.vehicleType||'Not specified')}</b></div><div>🗣️ <b>${escapeHtml(b.language||'Any')}</b></div></div>${locationLinks(b,true)}${flightDetails(b)}${isAccepted?`<div class="driver-customer-details">Customer: <b>${escapeHtml(b.name||'')}</b><br>Phone: <b>${escapeHtml(b.phone||'')}</b><br><small>Booking ID: ${escapeHtml(b.id)}</small></div>${renderTripStatus(b,true)}<div class="whatsapp-actions"><a class="whatsapp-button" href="${adminWhatsAppLink(b,'support')}" target="_blank" rel="noopener">💬 WhatsApp admin</a></div>`:`<div class="driver-match-reason">${escapeHtml(matchReasons(b).join(' • '))}</div><button class="accept" onclick="acceptJob('${escapeHtml(b.docId)}')">Accept job</button>`}</div>`; };
  const acceptedHtml=accepted.length?`<div class="driver-section-title"><h3>My accepted jobs</h3><span>${accepted.length} active job${accepted.length===1?'':'s'}</span></div>`+accepted.map(card).join(''):'<div class="driver-section-title"><h3>My accepted jobs</h3><span>No active jobs</span></div>';
  const availableHtml=available.length?`<div class="driver-section-title matched-title"><h3>Matched jobs available</h3><span>${available.length} job${available.length===1?'':'s'} to review</span></div>`+available.map(card).join(''):'<div class="driver-section-title matched-title"><h3>Matched jobs available</h3><span>No matching jobs right now</span></div>';
  $('#driverJobs').innerHTML=acceptedHtml+availableHtml;
}

async function getPublicDriverProfile(uid){ if(!uid)return null; if(publicProfileCache.has(uid))return publicProfileCache.get(uid); try{const snap=await window.FB.getDoc(window.FB.doc(db,'driverPublicProfiles',uid)); const p=snap.exists()?snap.data():null; publicProfileCache.set(uid,p); return p;}catch(e){console.error('Driver profile read failed',e);return null;} }
async function refreshCustomerDriverProfiles(){ if(currentRole!=='customer')return; const ids=[...new Set(bookings.filter(b=>b.driverUid).map(b=>b.driverUid))]; await Promise.all(ids.map(getPublicDriverProfile)); renderCustomerBookings(true); }
function driverCard(b,p){
  if(!p) return b.driver?'<div class="driver-card"><b>Driver assigned:</b> '+escapeHtml(b.driver)+'<br><b>Vehicle:</b> '+escapeHtml(b.driverVehicleType||b.vehicleType||'')+'<br><b>Model:</b> '+escapeHtml(b.driverCarModel||'Not provided')+'<br><b>Color:</b> '+escapeHtml(b.driverCarColor||'Not provided')+'<br><b>Plate:</b> '+escapeHtml(b.driverPlateNumber||'')+'</div>':'';
  return '<div class="driver-card"><div class="photo-grid"><div><img src="'+(p.selfieDataUrl||'')+'" alt="Assigned driver"><small>Driver</small></div><div><img src="'+(p.carPhotoDataUrl||'')+'" alt="Assigned vehicle"><small>Vehicle</small></div></div><p><b>'+escapeHtml(p.displayName||b.driver||'Assigned driver')+'</b><br>Vehicle: '+escapeHtml(p.vehicleType||b.vehicleType||'')+'<br>Model: <b>'+escapeHtml(p.carModel||b.driverCarModel||'Not provided')+'</b><br>Color: <b>'+escapeHtml(p.carColor||b.driverCarColor||'Not provided')+'</b><br>Plate: <b>'+escapeHtml(p.plateNumber||b.driverPlateNumber||'')+'</b></p></div>';
}
function renderCustomerBookings(skipRefresh=false){
  if(currentRole!=='customer'){ $('#customerBookings').innerHTML=''; return; }
  const list=[...bookings].sort((a,b)=>String(b.date+b.time).localeCompare(String(a.date+a.time)));
  const bookingForm=$('#bookingForm'); if(bookingForm&&list.length) bookingForm.classList.add('hidden');
  if(!list.length){ $('#customerBookings').innerHTML='<p class="muted">No bookings yet.</p>'; return; }
  $('#customerBookings').innerHTML='<div class="customer-bookings-header"><div><h3>Your bookings</h3><p class="muted">Your existing bookings are shown below.</p></div><button class="secondary" type="button" onclick="startNewBooking()">＋ New booking</button></div>'+list.map(b=>`<div class="booking"><h3>${escapeHtml(b.id)} <span class="badge">${escapeHtml(b.status)}</span></h3><p>${escapeHtml(b.pickup)} → ${escapeHtml(b.destination)}</p><div class="trip-schedule compact"><span>🗓 TRIP SCHEDULE</span><strong>${escapeHtml(formatDate(b.date))}</strong><b>${escapeHtml(formatTime(b.time))}</b></div>${locationLinks(b,false)}<div class="customer-party-summary"><div>👤 <b>${escapeHtml(String(b.adults ?? b.passengers ?? 0))}</b> adult${Number(b.adults ?? b.passengers ?? 0)===1?'':'s'}${Number(b.children ?? 0)>0?' • '+escapeHtml(String(b.children))+' children':''}</div><div>🧳 <b>${escapeHtml(String(b.luggage ?? 0))}</b> total bags • Checked: ${escapeHtml(String(b.checkedLuggage ?? b.luggage ?? 0))} • Hand carry: ${escapeHtml(String(b.handCarry ?? 0))}</div><div class="luggage-breakdown">Large: ${escapeHtml(String(b.largeLuggage ?? 0))} • Medium: ${escapeHtml(String(b.mediumLuggage ?? 0))} • Small: ${escapeHtml(String(b.smallLuggage ?? 0))}</div></div><p>${escapeHtml(b.language)} • Vehicle: <b>${escapeHtml(b.vehicleType||'Not specified')}</b></p>${b.flightNumber||b.flightType||b.terminal||b.meetInstructions?`<div class="flight-details"><b>✈️ FLIGHT DETAILS</b><br>${b.flightType?`Trip: ${escapeHtml(b.flightType)}<br>`:''}${b.flightNumber?`Flight: <b>${escapeHtml(b.flightNumber)}</b><br>`:''}${b.flightDate||b.flightTime?`Flight schedule: ${escapeHtml(formatDateTime(b.flightDate,b.flightTime))}<br>`:''}${b.terminal?`Terminal: ${escapeHtml(b.terminal)}<br>`:''}${b.meetInstructions?`Meet / pickup: ${escapeHtml(b.meetInstructions)}`:''}</div>`:''}${b.status==='Accepted'?renderTripStatus(b,false)+driverCard(b,publicProfileCache.get(b.driverUid))+`<div class="whatsapp-actions"><a class="whatsapp-button" href="${adminWhatsAppLink(b,'support')}" target="_blank" rel="noopener">💬 WhatsApp admin</a><a class="whatsapp-button secondary-whatsapp" href="${adminWhatsAppLink(b,'group')}" target="_blank" rel="noopener">👥 Prepare WhatsApp group</a></div>`:`<div class="booking-waiting"><small>Waiting for a matched driver</small><div class="whatsapp-actions"><a class="whatsapp-button" href="${adminWhatsAppLink(b,'support')}" target="_blank" rel="noopener">💬 Contact admin on WhatsApp</a></div></div>`}</div>`).join('');
  if(!skipRefresh&&list.some(b=>b.driverUid)) refreshCustomerDriverProfiles();
}
window.startNewBooking=()=>{
  if(currentRole!=='customer') return;
  const form=$('#bookingForm'); if(form){ form.reset(); $('#bookingForm input[name="adults"]').value=1; $('#bookingForm input[name="children"]').value=0; $('#bookingForm input[name="largeLuggage"]').value=0; $('#bookingForm input[name="mediumLuggage"]').value=0; $('#bookingForm input[name="smallLuggage"]').value=0; $('#bookingForm input[name="handCarry"]').value=0; $('#bookingForm input[name="luggage"]').value=0; form.classList.remove('hidden'); form.scrollIntoView({behavior:'smooth',block:'start'}); updateDateTimePreview(); updatePassengerLuggagePreview(); }
}
function updatePassengerLuggagePreview(){
  const adults=Number($('#bookingForm input[name="adults"]')?.value||0), children=Number($('#bookingForm input[name="children"]')?.value||0);
  const large=Number($('#bookingForm input[name="largeLuggage"]')?.value||0), medium=Number($('#bookingForm input[name="mediumLuggage"]')?.value||0), small=Number($('#bookingForm input[name="smallLuggage"]')?.value||0), hand=Number($('#bookingForm input[name="handCarry"]')?.value||0);
  const checked=large+medium+small, total=checked+hand, pp=$('#passengerPreview'), lp=$('#luggagePreview'), totalInput=$('#bookingForm input[name="luggage"]');
  if(pp) pp.textContent=`Passengers: ${adults} adult${adults===1?'':'s'} • ${children} children • Total ${adults+children}`;
  if(lp) lp.textContent=`Luggage: ${checked} checked (${large} large • ${medium} medium • ${small} small) • ${hand} hand carry • Total ${total}`;
  if(totalInput) totalInput.value=total;
}
function render(){
  renderSchedules(); renderJobs(); renderCustomerBookings();
  const total=bookings.length,availableCount=bookings.filter(b=>b.status==='Available').length,accepted=bookings.filter(b=>b.status==='Accepted').length,completed=bookings.filter(b=>b.status==='Completed').length;
  $('#adminStats').innerHTML=`<div class="stat"><b>${total}</b><small>Total</small></div><div class="stat"><b>${availableCount}</b><small>Available</small></div><div class="stat"><b>${accepted}</b><small>Accepted</small></div><div class="stat"><b>${completed}</b><small>Completed</small></div>`;
  const list=filter==='All'?bookings:bookings.filter(b=>b.status===filter);
  $('#adminBookings').innerHTML=list.length?list.map(b=>`<div class="booking"><h3>${escapeHtml(b.id)} <span class="badge">${escapeHtml(b.status)}</span></h3><p><b>${escapeHtml(b.pickup)}</b> → ${escapeHtml(b.destination)}</p>${locationLinks(b,false)}<div class="trip-schedule compact"><span>🗓 TRIP SCHEDULE</span><strong>${escapeHtml(formatDate(b.date))}</strong><b>${escapeHtml(formatTime(b.time))}</b></div><p>${escapeHtml(b.name)} • ${escapeHtml(b.phone)}</p><p>Vehicle: <b>${escapeHtml(b.vehicleType||'Not specified')}</b> • Language: ${escapeHtml(b.language||'Any')} • Luggage: <b>${escapeHtml(String(b.luggage ?? 0))}</b></p>${b.flightNumber||b.flightType||b.terminal||b.meetInstructions?`<div class="flight-details"><b>✈️ FLIGHT DETAILS</b><br>${b.flightType?`Trip: ${escapeHtml(b.flightType)}<br>`:''}${b.flightNumber?`Flight: <b>${escapeHtml(b.flightNumber)}</b><br>`:''}${b.flightDate||b.flightTime?`Flight schedule: ${escapeHtml(formatDateTime(b.flightDate,b.flightTime))}<br>`:''}${b.terminal?`Terminal: ${escapeHtml(b.terminal)}<br>`:''}${b.meetInstructions?`Meet / pickup: ${escapeHtml(b.meetInstructions)}`:''}</div>`:''}<div class="admin-trip-summary">${renderTripStatus(b,false)}</div><small>${b.driver?`Driver: ${escapeHtml(b.driver)} • ${escapeHtml(b.driverCarModel||'')} • ${escapeHtml(b.driverCarColor||'')} • Plate: ${escapeHtml(b.driverPlateNumber||'')} • WhatsApp: ${escapeHtml(b.driverWhatsApp||'Not provided')}`:'No driver yet'}</small><div class="whatsapp-actions"><a class="whatsapp-button" href="${adminWhatsAppLink(b,'support')}" target="_blank" rel="noopener">💬 Open admin WhatsApp</a>${b.status==='Accepted'?`<a class="whatsapp-button secondary-whatsapp" href="${adminWhatsAppLink(b,'group')}" target="_blank" rel="noopener">👥 Prepare WhatsApp group</a>`:''}</div>${b.status==='Accepted'&&currentRole==='admin'?`<button class="secondary complete" onclick="completeJob('${escapeHtml(b.docId)}')">Mark completed</button>`:''}</div>`).join(''):'<p class="muted">No bookings.</p>';
}

window.completeJob=async id=>{const booking=bookings.find(x=>x.docId===id||x.id===id);if(!booking||!firebaseReady||currentRole!=='admin')return;try{await window.FB.updateDoc(window.FB.doc(db,'bookings',booking.docId),{status:'Completed',tripStatus:'Completed',tripStatusUpdatedAt:window.FB.serverTimestamp(),completedAt:window.FB.serverTimestamp()});}catch(e){alert('Could not complete booking: '+e.message);}};
$$('.filter').forEach(x=>x.onclick=()=>{$$('.filter').forEach(y=>y.classList.remove('active'));x.classList.add('active');filter=x.dataset.filter;render();});
$('#clearAll').onclick=()=>alert('Cloud data is protected.');
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
async function reverseGeocodeCurrentLocation(lat,lng){
  const url='https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+
    encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lng)+'&localityLanguage=en';
  const response=await fetch(url);
  if(!response.ok) throw new Error('Address lookup failed');
  const data=await response.json();
  const parts=[data.locality,data.city,data.principalSubdivision,data.countryName]
    .filter((value,index,array)=>value && array.indexOf(value)===index);
  return parts.join(', ');
}
function saveCurrentPickupLocation(lat,lng,address=''){
  const latInput=$('#bookingForm input[name="pickupLat"]'),lngInput=$('#bookingForm input[name="pickupLng"]');
  const input=$('#bookingForm input[name="pickup"]');
  if(latInput)latInput.value=Number(lat).toFixed(6);
  if(lngInput)lngInput.value=Number(lng).toFixed(6);
  if(input && !String(input.value||'').trim()) input.value=address || 'Current location';
}
function locationErrorMessage(err){
  if(err?.code===1)return 'Location permission was denied. Please allow Location for your browser, then try again.';
  if(err?.code===2)return 'Your device could not determine its location. Turn on GPS/location services and try again.';
  if(err?.code===3)return 'Location request timed out. Turn on GPS and try again.';
  return 'Could not get your current location. Please enter the pickup address manually.';
}
async function useCurrentPickupLocation(){
  const status=$('#pickupLocationStatus');
  if(!window.isSecureContext){if(status)status.textContent='Location requires HTTPS. Please open the GitHub Pages link in Chrome.';return;}
  if(!navigator.geolocation){if(status)status.textContent='This browser does not provide location services. Please enter the pickup address manually.';return;}
  if(status)status.textContent='📍 Getting your current location…';
  navigator.geolocation.getCurrentPosition(
    async pos=>{
      const lat=pos.coords.latitude,lng=pos.coords.longitude;
      saveCurrentPickupLocation(lat,lng);
      if(status)status.textContent='✓ GPS location saved. Getting a readable location name…';
      try{
        const address=await reverseGeocodeCurrentLocation(lat,lng);
        saveCurrentPickupLocation(lat,lng,address);
        if(status)status.textContent=address
          ? '✓ Current location saved: '+address
          : '✓ Current location saved. You can edit the pickup location above.';
      }catch(error){
        console.warn('Reverse geocoding error:',error);
        if(status)status.textContent='✓ GPS location saved. You can edit the pickup location above.';
      }
    },
    err=>{
      if(status)status.textContent=locationErrorMessage(err);
      console.warn('Geolocation error:',err);
    },
    {enableHighAccuracy:true,timeout:20000,maximumAge:0}
  );
}
$('#usePickupLocation')?.addEventListener('click',useCurrentPickupLocation);
$('#bookingForm input[name="pickup"]')?.addEventListener('input',()=>{ const lat=$('#bookingForm input[name="pickupLat"]'),lng=$('#bookingForm input[name="pickupLng"]'),status=$('#pickupLocationStatus'); if(lat)lat.value=''; if(lng)lng.value=''; if(status)status.textContent=''; });
setDateLimits();
['#bookingForm input[name="date"]','#bookingForm input[name="time"]','#bookingForm input[name="flightDate"]','#bookingForm input[name="flightTime"]'].forEach(sel => $(sel)?.addEventListener('change', updateDateTimePreview));
['#bookingForm input[name="adults"]','#bookingForm input[name="children"]','#bookingForm input[name="largeLuggage"]','#bookingForm input[name="mediumLuggage"]','#bookingForm input[name="smallLuggage"]','#bookingForm input[name="handCarry"]'].forEach(sel => $(sel)?.addEventListener('input', updatePassengerLuggagePreview));
['#unavailableDate','#unavailableFrom','#unavailableTo'].forEach(sel => $(sel)?.addEventListener('change', updateUnavailablePreview));
updateDateTimePreview();
updatePassengerLuggagePreview();
updateUnavailablePreview();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js');
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden');});$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;}};
initFirebase(); updateAuthUI(); render();
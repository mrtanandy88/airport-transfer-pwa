import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const KEY = 'airportTransferBookingsV3';
const SKEY = 'airportTransferSchedulesV3';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let bookings = [];
let schedules = [];
let driverProfile = null;
let currentUser = null;
let currentRole = null;
let db = null;
let auth = null;
let firebaseReady = false;
let filter = 'All';
let stopCloudListeners = [];

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
    auth = am.getAuth(fbApp);
    db = fs.getFirestore(fbApp);
    window.FB = { ...am, ...fs };
    firebaseReady = true;
    $('#modeNotice').textContent = 'Firebase connected. Matching checks language, private schedule and booking time.';

    am.onAuthStateChanged(auth, async user => {
      stopListeners();
      currentUser = user;
      currentRole = null;
      driverProfile = null;
      bookings = [];
      schedules = [];
      if (user) {
        try {
          const snap = await fs.getDoc(fs.doc(db, 'users', user.uid));
          currentRole = snap.exists() ? snap.data().role : null;
          if (!['customer', 'driver', 'admin'].includes(currentRole)) {
            await am.signOut(auth);
            alert('Your account has no valid app role.');
            return;
          }
          driverProfile = snap.exists() ? snap.data() : null;
          startCloudListeners();
        } catch (e) {
          console.error(e);
          alert('Could not load your account profile: ' + e.message);
          await am.signOut(auth);
          return;
        }
      }
      updateAuthUI(); render();
    });
  } catch (e) {
    console.error(e);
    firebaseReady = false;
    $('#modeNotice').textContent = 'Firebase could not start: ' + e.message;
    updateAuthUI(); render();
  }
}

function stopListeners() {
  stopCloudListeners.forEach(stop => { try { stop(); } catch (_) {} });
  stopCloudListeners = [];
}

function mergeDocs(snap) {
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
}

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
    stopCloudListeners.push(F.onSnapshot(scheduleQ, snap => { schedules = mergeDocs(snap); renderSchedules(); renderJobs(); }, handleCloudError));
  }
  if (currentRole === 'admin') {
    stopCloudListeners.push(F.onSnapshot(F.collection(db, 'bookings'), snap => { bookings = mergeDocs(snap); render(); }, handleCloudError));
  }
}

let driverAvailable = [];
let driverAccepted = [];
function rebuildDriverBookings(available, accepted) {
  if (available) driverAvailable = available;
  if (accepted) driverAccepted = accepted;
  const map = new Map();
  [...driverAvailable, ...driverAccepted].forEach(b => map.set(b.docId, b));
  bookings = [...map.values()];
  render();
}

function handleCloudError(error) {
  console.error(error);
  const code = error?.code || 'unknown';
  $('#modeNotice').textContent = code === 'permission-denied'
    ? 'Firebase denied this action. Check the user role and published Firestore rules.'
    : 'Firebase error (' + code + '): ' + (error?.message || 'Unknown error');
}

function show(id) {
  $$('.screen').forEach(x => x.classList.remove('active'));
  $('#' + id).classList.add('active');
  render(); updateAuthUI();
}
$$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));

function updateAuthUI() {
  const signed = !!currentUser;
  if (!firebaseReady) {
    $('#customerAuth').classList.add('hidden'); $('#bookingForm').classList.remove('hidden');
    $('#driverAuth').classList.add('hidden'); $('#driverArea').classList.remove('hidden');
    $('#adminAuth').classList.add('hidden'); $('#adminArea').classList.remove('hidden');
    $('#customerLogout').classList.add('hidden'); $('#driverLogout').classList.add('hidden');
    return;
  }
  $('#customerAuth').classList.toggle('hidden', signed && currentRole === 'customer');
  $('#bookingForm').classList.toggle('hidden', !(signed && currentRole === 'customer'));
  $('#customerLogout').classList.toggle('hidden', !(signed && currentRole === 'customer'));
  $('#driverAuth').classList.toggle('hidden', signed && currentRole === 'driver');
  $('#driverArea').classList.toggle('hidden', !(signed && currentRole === 'driver'));
  $('#driverLogout').classList.toggle('hidden', !(signed && currentRole === 'driver'));
  $('#adminAuth').classList.toggle('hidden', signed && currentRole === 'admin');
  $('#adminArea').classList.toggle('hidden', !(signed && currentRole === 'admin'));
}

function selectedLanguages() {
  return [...$('#driverLanguages').selectedOptions].map(o => o.value);
}

async function signUp(role, email, password) {
  if (!firebaseReady) return alert('Firebase is not connected.');
  email = (email || '').trim();
  if (!email || !password) return alert('Enter email and password.');
  if (password.length < 6) return alert('Password must be at least 6 characters.');
  try {
    const result = await window.FB.createUserWithEmailAndPassword(auth, email, password);
    const profile = { email, role, createdAt: window.FB.serverTimestamp() };
    if (role === 'driver') profile.languages = selectedLanguages();
    await window.FB.setDoc(window.FB.doc(db, 'users', result.user.uid), profile);
    alert('Account created.');
  } catch (e) { alert(e.message); }
}

async function signIn(expectedRole, email, password) {
  if (!firebaseReady) return alert('Firebase is not connected.');
  email = (email || '').trim();
  if (!email || !password) return alert('Enter email and password.');
  try {
    const result = await window.FB.signInWithEmailAndPassword(auth, email, password);
    const snap = await window.FB.getDoc(window.FB.doc(db, 'users', result.user.uid));
    const actualRole = snap.exists() ? snap.data().role : null;
    if (actualRole !== expectedRole) {
      await window.FB.signOut(auth);
      alert(`This account is registered as ${actualRole || 'unknown'}, not ${expectedRole}.`);
    }
  } catch (e) { alert(e.message); }
}

async function logout() {
  if (firebaseReady && auth) await window.FB.signOut(auth);
  stopListeners(); currentUser = null; currentRole = null; driverProfile = null; bookings = []; schedules = [];
  updateAuthUI(); render();
}

$('#customerSignup').onclick = () => signUp('customer', $('#customerEmail').value, $('#customerPassword').value);
$('#customerLogin').onclick = () => signIn('customer', $('#customerEmail').value, $('#customerPassword').value);
$('#driverSignup').onclick = () => signUp('driver', $('#driverEmail').value, $('#driverPassword').value);
$('#driverLogin').onclick = () => signIn('driver', $('#driverEmail').value, $('#driverPassword').value);
$('#adminLogin').onclick = () => signIn('admin', $('#adminEmail').value, $('#adminPassword').value);
$('#customerLogout').onclick = logout;
$('#driverLogout').onclick = logout;

async function addBooking(booking) {
  if (firebaseReady) {
    if (!currentUser || currentRole !== 'customer') throw new Error('Please sign in as a customer.');
    await window.FB.addDoc(window.FB.collection(db, 'bookings'), { ...booking, customerUid: currentUser.uid, createdAt: window.FB.serverTimestamp() });
  } else {
    bookings.unshift(booking); localStorage.setItem(KEY, JSON.stringify(bookings)); render();
  }
}

$('#bookingForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const booking = { id: 'AT-' + Date.now().toString().slice(-6), name: f.get('name'), phone: f.get('phone'), pickup: f.get('pickup'), destination: f.get('destination'), date: f.get('date'), time: f.get('time'), passengers: Number(f.get('passengers')), luggage: Number(f.get('luggage') || 0), language: f.get('language'), status: 'Available', driver: '', driverUid: '' };
  try { await addBooking(booking); e.target.reset(); $('#customerResult').innerHTML = `<div class="booking success"><h3>Booking placed ✓</h3><p>Your booking ID is <b>${escapeHtml(booking.id)}</b>.</p><span class="badge">Available</span></div>`; }
  catch (err) { alert('Could not save booking: ' + err.message); }
});

function timeToMinutes(t) {
  const [h, m] = String(t || '').split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : -1;
}

function overlapsSchedule(booking, schedule) {
  if (!schedule || schedule.date !== booking.date) return false;
  const bt = timeToMinutes(booking.time);
  const from = timeToMinutes(schedule.from);
  const to = timeToMinutes(schedule.to);
  return bt >= from && bt < to;
}

function languageMatches(booking) {
  if (!booking.language || booking.language === 'Any') return true;
  const languages = Array.isArray(driverProfile?.languages) ? driverProfile.languages : [];
  // Existing driver accounts without a languages field remain eligible until their profile is updated.
  if (!languages.length) return true;
  return languages.includes(booking.language);
}

function hasAcceptedConflict(booking) {
  return driverAccepted.some(b => b.status === 'Accepted' && b.date === booking.date && Math.abs(timeToMinutes(b.time) - timeToMinutes(booking.time)) < 120);
}

function matchReasons(booking) {
  const reasons = [];
  if (booking.language && booking.language !== 'Any') reasons.push('language match');
  reasons.push('schedule clear');
  reasons.push('no nearby accepted job');
  return reasons;
}

function canDriverTake(booking) {
  return languageMatches(booking)
    && !schedules.some(s => overlapsSchedule(booking, s))
    && !hasAcceptedConflict(booking);
}

async function acceptJob(id) {
  const booking = bookings.find(x => x.docId === id || x.id === id);
  if (!booking || !currentUser || currentRole !== 'driver') return alert('Please sign in as a driver first.');
  if (booking.status !== 'Available') return alert('This job has already been taken.');
  if (!canDriverTake(booking)) return alert('This job no longer matches your language, private schedule or existing job schedule.');
  try {
    if (firebaseReady) {
      await window.FB.updateDoc(window.FB.doc(db, 'bookings', booking.docId), { status: 'Accepted', driver: currentUser.email, driverUid: currentUser.uid, acceptedAt: window.FB.serverTimestamp() });
    } else {
      booking.status = 'Accepted'; booking.driver = 'Demo Driver'; localStorage.setItem(KEY, JSON.stringify(bookings)); render();
    }
    alert('Job accepted and customer will see the assigned driver.');
  } catch (e) { alert('Could not accept job (' + (e.code || 'error') + '): ' + e.message); }
}
window.acceptJob = acceptJob;

async function addUnavailable() {
  const date = $('#unavailableDate').value;
  const from = $('#unavailableFrom').value;
  const to = $('#unavailableTo').value;
  if (!currentUser || currentRole !== 'driver') return alert('Please sign in as a driver first.');
  if (!date || !from || !to) return alert('Please select a date, From time and To time.');
  if (from >= to) return alert('The To time must be later than the From time.');
  const duplicate = schedules.some(s => s.date === date && s.from === from && s.to === to);
  if (duplicate) { $('#scheduleMessage').textContent = 'Already added — duplicate schedule prevented.'; return; }

  const schedule = { date, from, to, driverUid: currentUser.uid };
  const button = $('#addUnavailable');
  button.disabled = true;
  button.textContent = 'Saving...';
  $('#scheduleMessage').textContent = '';
  try {
    if (firebaseReady) {
      const safeId = encodeURIComponent(`${currentUser.uid}_${date}_${from}_${to}`);
      const ref = window.FB.doc(db, 'driverSchedules', safeId);
      const existing = await window.FB.getDoc(ref);
      if (existing.exists()) throw new Error('That exact unavailable time already exists.');
      await window.FB.setDoc(ref, { ...schedule, createdAt: window.FB.serverTimestamp() });
    } else {
      schedule.id = 'S-' + Date.now(); schedules.unshift(schedule); localStorage.setItem(SKEY, JSON.stringify(schedules));
    }
    $('#scheduleMessage').textContent = '✓ Unavailable time saved. Duplicate entries are blocked.';
    $('#unavailableDate').value = ''; $('#unavailableFrom').value = ''; $('#unavailableTo').value = '';
  } catch (e) {
    console.error(e);
    $('#scheduleMessage').textContent = '✕ Save failed: ' + (e.code || 'error') + ' — ' + e.message;
    alert('Could not save unavailable time.\n\n' + (e.code || 'error') + ': ' + e.message);
  } finally {
    button.disabled = false; button.textContent = 'Add unavailable time';
  }
}
$('#addUnavailable').onclick = addUnavailable;

async function deleteSchedule(id) {
  if (!currentUser || currentRole !== 'driver') return;
  if (!confirm('Remove this unavailable time?')) return;
  try {
    if (firebaseReady) await window.FB.deleteDoc(window.FB.doc(db, 'driverSchedules', id));
    else { schedules = schedules.filter(s => (s.docId || s.id) !== id); localStorage.setItem(SKEY, JSON.stringify(schedules)); renderSchedules(); renderJobs(); }
  } catch (e) { alert('Could not remove schedule: ' + e.message); }
}
window.deleteSchedule = deleteSchedule;

function renderSchedules() {
  $('#scheduleList').innerHTML = schedules.length ? schedules.sort((a,b) => `${a.date}${a.from}`.localeCompare(`${b.date}${b.from}`)).map(s => `<div class="schedule"><b>${escapeHtml(s.date)}</b><span>${escapeHtml(s.from)}–${escapeHtml(s.to)} <button class="mini-delete" onclick="deleteSchedule('${escapeHtml(s.docId || s.id)}')" type="button">×</button></span></div>`).join('') : '<p class="muted">No unavailable times added.</p>';
}

function renderJobs() {
  if (currentRole !== 'driver') { $('#driverJobs').innerHTML = ''; return; }
  const available = driverAvailable.filter(b => b.status === 'Available' && canDriverTake(b));
  $('#driverJobs').innerHTML = available.length ? available.map(b => `<div class="booking"><h3>${escapeHtml(b.pickup)} → ${escapeHtml(b.destination)}</h3><p>${escapeHtml(b.date)} at ${escapeHtml(b.time)} • ${escapeHtml(String(b.passengers))} passenger(s) • ${escapeHtml(b.language)}</p><small>${escapeHtml(b.name)} • ${escapeHtml(b.id)} • ${escapeHtml(matchReasons(b).join(' • '))}</small><button class="accept" onclick="acceptJob('${escapeHtml(b.docId)}')">Accept job</button></div>`).join('') : '<p class="muted">No jobs currently matching your language, private schedule and existing jobs.</p>';
}

function renderCustomerBookings() {
  if (currentRole !== 'customer') { $('#customerBookings').innerHTML = ''; return; }
  const list = [...bookings].sort((a,b) => String(b.date + b.time).localeCompare(String(a.date + a.time)));
  $('#customerBookings').innerHTML = list.length ? `<h3>Your bookings</h3>` + list.map(b => `<div class="booking"><h3>${escapeHtml(b.id)} <span class="badge">${escapeHtml(b.status)}</span></h3><p>${escapeHtml(b.pickup)} → ${escapeHtml(b.destination)}</p><p>${escapeHtml(b.date)} ${escapeHtml(b.time)} • ${escapeHtml(b.language)}</p><small>${b.driver ? `Driver assigned: ${escapeHtml(b.driver)}` : 'Waiting for a matched driver'}</small></div>`).join('') : '<p class="muted">No bookings yet.</p>';
}

function render() {
  renderSchedules(); renderJobs(); renderCustomerBookings();
  const total = bookings.length, availableCount = bookings.filter(b => b.status === 'Available').length, accepted = bookings.filter(b => b.status === 'Accepted').length, completed = bookings.filter(b => b.status === 'Completed').length;
  $('#adminStats').innerHTML = `<div class="stat"><b>${total}</b><small>Total</small></div><div class="stat"><b>${availableCount}</b><small>Available</small></div><div class="stat"><b>${accepted}</b><small>Accepted</small></div><div class="stat"><b>${completed}</b><small>Completed</small></div>`;
  const list = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);
  $('#adminBookings').innerHTML = list.length ? list.map(b => `<div class="booking"><h3>${escapeHtml(b.id)} <span class="badge">${escapeHtml(b.status)}</span></h3><p><b>${escapeHtml(b.pickup)}</b> → ${escapeHtml(b.destination)}</p><p>${escapeHtml(b.date)} ${escapeHtml(b.time)} • ${escapeHtml(b.name)} • ${escapeHtml(b.phone)}</p><small>${b.driver ? `Driver: ${escapeHtml(b.driver)}` : 'No driver yet'}</small>${b.status === 'Accepted' && currentRole === 'admin' ? `<button class="secondary complete" onclick="completeJob('${escapeHtml(b.docId)}')">Mark completed</button>` : ''}</div>`).join('') : '<p class="muted">No bookings.</p>';
}

window.completeJob = async id => {
  const booking = bookings.find(x => x.docId === id || x.id === id);
  if (!booking || !firebaseReady || currentRole !== 'admin') return;
  try { await window.FB.updateDoc(window.FB.doc(db, 'bookings', booking.docId), { status: 'Completed', completedAt: window.FB.serverTimestamp() }); }
  catch (e) { alert('Could not complete booking: ' + e.message); }
};

$$('.filter').forEach(x => x.onclick = () => { $$('.filter').forEach(y => y.classList.remove('active')); x.classList.add('active'); filter = x.dataset.filter; render(); });
$('#clearAll').onclick = () => { if (firebaseReady) return alert('Cloud data is protected.'); if (confirm('Clear all demo bookings?')) { bookings = []; localStorage.setItem(KEY, '[]'); render(); } };

function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char])); }
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
$('#installBtn').onclick = async () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; } };

initFirebase();
updateAuthUI();
render();

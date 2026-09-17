import { firebaseConfig, firebaseConfigured } from './firebase-config.js';

const KEY = 'airportTransferBookingsV2';
const SKEY = 'airportTransferSchedulesV2';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let bookings = JSON.parse(localStorage.getItem(KEY) || '[]');
let schedules = JSON.parse(localStorage.getItem(SKEY) || '[]');
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
    updateAuthUI();
    render();
    return;
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
    $('#modeNotice').textContent = 'Firebase connected. Accounts and bookings sync across devices.';

    am.onAuthStateChanged(auth, async user => {
      stopListeners();
      currentUser = user;
      currentRole = null;
      bookings = [];
      schedules = [];

      if (user) {
        try {
          const snap = await window.FB.getDoc(window.FB.doc(db, 'users', user.uid));
          currentRole = snap.exists() ? snap.data().role : null;
          if (!currentRole) {
            await am.signOut(auth);
            alert('Your account exists, but no app role is assigned. Please contact the admin.');
            return;
          }
          startCloudListeners();
        } catch (e) {
          console.error(e);
          alert('Could not load your account profile: ' + e.message);
          await am.signOut(auth);
          return;
        }
      }

      updateAuthUI();
      render();
    });
  } catch (e) {
    console.error(e);
    firebaseReady = false;
    $('#modeNotice').textContent = 'Firebase could not start. Demo mode is active.';
    updateAuthUI();
    render();
  }
}

function stopListeners() {
  stopCloudListeners.forEach(stop => {
    try { stop(); } catch (_) {}
  });
  stopCloudListeners = [];
}

function startCloudListeners() {
  if (!firebaseReady || !currentUser || !currentRole) return;
  const F = window.FB;

  if (currentRole === 'customer') {
    const q = F.query(
      F.collection(db, 'bookings'),
      F.where('customerUid', '==', currentUser.uid)
    );
    stopCloudListeners.push(F.onSnapshot(q, snap => {
      bookings = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      render();
    }, handleCloudError));
  }

  if (currentRole === 'driver') {
    const jobsQuery = F.query(
      F.collection(db, 'bookings'),
      F.where('status', '==', 'Available')
    );
    stopCloudListeners.push(F.onSnapshot(jobsQuery, snap => {
      bookings = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      render();
    }, handleCloudError));

    const scheduleQuery = F.query(
      F.collection(db, 'driverSchedules'),
      F.where('driverUid', '==', currentUser.uid)
    );
    stopCloudListeners.push(F.onSnapshot(scheduleQuery, snap => {
      schedules = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      render();
    }, handleCloudError));
  }

  if (currentRole === 'admin') {
    stopCloudListeners.push(F.onSnapshot(F.collection(db, 'bookings'), snap => {
      bookings = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      render();
    }, handleCloudError));
  }
}

function handleCloudError(error) {
  console.error(error);
  if (error?.code === 'permission-denied') {
    $('#modeNotice').textContent = 'Firebase is connected, but Firestore security rules need to be published.';
  } else {
    $('#modeNotice').textContent = 'Firebase error: ' + (error?.message || 'Unknown error');
  }
}

function saveLocal() {
  localStorage.setItem(KEY, JSON.stringify(bookings));
  localStorage.setItem(SKEY, JSON.stringify(schedules));
  render();
}

function show(id) {
  $$('.screen').forEach(x => x.classList.remove('active'));
  $('#' + id).classList.add('active');
  render();
  updateAuthUI();
}

$$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));

function updateAuthUI() {
  const signed = !!currentUser;
  const firebaseMode = firebaseReady;

  $('#customerAuth').classList.toggle('hidden', firebaseMode && signed && currentRole === 'customer');
  $('#bookingForm').classList.toggle('hidden', firebaseMode && (!signed || currentRole !== 'customer'));
  $('#customerLogout').classList.toggle('hidden', !(signed && currentRole === 'customer'));

  $('#driverAuth').classList.toggle('hidden', firebaseMode && signed && currentRole === 'driver');
  $('#driverArea').classList.toggle('hidden', firebaseMode && (!signed || currentRole !== 'driver'));
  $('#driverLogout').classList.toggle('hidden', !(signed && currentRole === 'driver'));

  $('#adminAuth').classList.toggle('hidden', firebaseMode && signed && currentRole === 'admin');
  $('#adminArea').classList.toggle('hidden', firebaseMode && (!signed || currentRole !== 'admin'));

  if (!firebaseMode) {
    $('#customerAuth').classList.add('hidden');
    $('#bookingForm').classList.remove('hidden');
    $('#driverAuth').classList.add('hidden');
    $('#driverArea').classList.remove('hidden');
    $('#adminAuth').classList.add('hidden');
    $('#adminArea').classList.remove('hidden');
  }
}

async function signUp(role, email, password) {
  if (!firebaseReady) return alert('Firebase is not configured yet.');
  if (!email || !password) return alert('Enter email and password.');
  if (password.length < 6) return alert('Password must be at least 6 characters.');

  try {
    const result = await window.FB.createUserWithEmailAndPassword(auth, email.trim(), password);
    await window.FB.setDoc(window.FB.doc(db, 'users', result.user.uid), {
      email: email.trim(),
      role,
      createdAt: window.FB.serverTimestamp()
    });
    alert('Account created successfully. You are now signed in.');
  } catch (e) {
    alert(e.message);
  }
}

async function signIn(expectedRole, email, password) {
  if (!firebaseReady) return alert('Firebase is not connected.');
  if (!email || !password) return alert('Enter email and password.');

  try {
    const result = await window.FB.signInWithEmailAndPassword(auth, email.trim(), password);
    const snap = await window.FB.getDoc(window.FB.doc(db, 'users', result.user.uid));
    const actualRole = snap.exists() ? snap.data().role : null;

    if (actualRole !== expectedRole) {
      await window.FB.signOut(auth);
      return alert(`This account is registered as ${actualRole || 'unknown'}, not ${expectedRole}.`);
    }
  } catch (e) {
    alert(e.message);
  }
}

async function logout() {
  if (firebaseReady && auth) await window.FB.signOut(auth);
  stopListeners();
  currentUser = null;
  currentRole = null;
  bookings = [];
  schedules = [];
  updateAuthUI();
  render();
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
    await window.FB.addDoc(window.FB.collection(db, 'bookings'), {
      ...booking,
      customerUid: currentUser.uid,
      createdAt: window.FB.serverTimestamp()
    });
  } else {
    bookings.unshift(booking);
    saveLocal();
  }
}

$('#bookingForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const booking = {
    id: 'AT-' + Date.now().toString().slice(-6),
    name: f.get('name'),
    phone: f.get('phone'),
    pickup: f.get('pickup'),
    destination: f.get('destination'),
    date: f.get('date'),
    time: f.get('time'),
    passengers: Number(f.get('passengers')),
    luggage: Number(f.get('luggage') || 0),
    language: f.get('language'),
    status: 'Available',
    driver: '',
    driverUid: ''
  };

  try {
    await addBooking(booking);
    e.target.reset();
    $('#customerResult').innerHTML = `<div class="booking success"><h3>Booking placed ✓</h3><p>Your booking ID is <b>${escapeHtml(booking.id)}</b>.</p><span class="badge">Available</span></div>`;
  } catch (err) {
    alert('Could not save booking: ' + err.message);
  }
});

function overlapsSchedule(booking, schedule) {
  return !!schedule && schedule.date === booking.date && String(booking.time) >= String(schedule.from) && String(booking.time) <= String(schedule.to);
}

function canDriverTake(booking) {
  return !schedules.some(schedule => overlapsSchedule(booking, schedule));
}

async function acceptJob(id) {
  const booking = bookings.find(x => (x.docId || x.id) === id);
  if (!booking) return;
  if (!currentUser || currentRole !== 'driver') return alert('Please sign in as a driver first.');
  if (!canDriverTake(booking)) return alert('You have an unavailable schedule overlapping this booking.');

  try {
    if (firebaseReady) {
      await window.FB.updateDoc(window.FB.doc(db, 'bookings', booking.docId), {
        status: 'Accepted',
        driver: currentUser.email,
        driverUid: currentUser.uid,
        acceptedAt: window.FB.serverTimestamp()
      });
      alert('Job accepted.');
    } else {
      booking.status = 'Accepted';
      booking.driver = 'Demo Driver';
      saveLocal();
    }
  } catch (e) {
    alert('Could not accept job: ' + e.message);
  }
}
window.acceptJob = acceptJob;

async function addUnavailable() {
  const date = $('#unavailableDate').value;
  const from = $('#unavailableFrom').value;
  const to = $('#unavailableTo').value;
  if (!date || !from || !to || from >= to) return alert('Please enter a valid unavailable date and time.');

  const schedule = {
    date,
    from,
    to,
    driverUid: currentUser?.uid || 'demo'
  };

  try {
    if (firebaseReady) {
      await window.FB.addDoc(window.FB.collection(db, 'driverSchedules'), schedule);
    } else {
      schedule.id = 'S-' + Date.now();
      schedules.push(schedule);
      saveLocal();
    }
    $('#unavailableDate').value = '';
    $('#unavailableFrom').value = '';
    $('#unavailableTo').value = '';
  } catch (e) {
    alert('Could not save availability: ' + e.message);
  }
}
$('#addUnavailable').onclick = addUnavailable;

function renderSchedules() {
  $('#scheduleList').innerHTML = schedules.length
    ? schedules.map(s => `<div class="schedule"><b>${escapeHtml(s.date)}</b><span>${escapeHtml(s.from)}–${escapeHtml(s.to)}</span></div>`).join('')
    : '<p class="muted">No unavailable times added.</p>';
}

function render() {
  renderSchedules();

  const available = bookings.filter(b => b.status === 'Available' && canDriverTake(b));
  $('#driverJobs').innerHTML = available.length
    ? available.map(b => `<div class="booking"><h3>${escapeHtml(b.pickup)} → ${escapeHtml(b.destination)}</h3><p>${escapeHtml(b.date)} at ${escapeHtml(b.time)} • ${escapeHtml(String(b.passengers))} passenger(s) • ${escapeHtml(b.language)}</p><small>${escapeHtml(b.name)} • ${escapeHtml(b.id)}</small><button class="accept" onclick="acceptJob('${escapeHtml(b.docId || b.id)}')">Accept job</button></div>`).join('')
    : '<p class="muted">No available jobs matching your schedule.</p>';

  const total = bookings.length;
  const availableCount = bookings.filter(b => b.status === 'Available').length;
  const accepted = bookings.filter(b => b.status === 'Accepted').length;
  const completed = bookings.filter(b => b.status === 'Completed').length;
  $('#adminStats').innerHTML = `<div class="stat"><b>${total}</b><small>Total</small></div><div class="stat"><b>${availableCount}</b><small>Available</small></div><div class="stat"><b>${accepted}</b><small>Accepted</small></div><div class="stat"><b>${completed}</b><small>Completed</small></div>`;

  const list = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);
  $('#adminBookings').innerHTML = list.length
    ? list.map(b => `<div class="booking"><h3>${escapeHtml(b.id)} <span class="badge">${escapeHtml(b.status)}</span></h3><p><b>${escapeHtml(b.pickup)}</b> → ${escapeHtml(b.destination)}</p><p>${escapeHtml(b.date)} ${escapeHtml(b.time)} • ${escapeHtml(b.name)} • ${escapeHtml(b.phone)}</p><small>${b.driver ? `Driver: ${escapeHtml(b.driver)}` : 'No driver yet'}</small>${b.status === 'Accepted' ? `<button class="secondary complete" onclick="completeJob('${escapeHtml(b.docId || b.id)}')">Mark completed</button>` : ''}</div>`).join('')
    : '<p class="muted">No bookings.</p>';
}

window.completeJob = async id => {
  const booking = bookings.find(x => (x.docId || x.id) === id);
  if (!booking || !firebaseReady || currentRole !== 'admin') return;
  try {
    await window.FB.updateDoc(window.FB.doc(db, 'bookings', booking.docId), {
      status: 'Completed',
      completedAt: window.FB.serverTimestamp()
    });
  } catch (e) {
    alert('Could not complete booking: ' + e.message);
  }
};

$$('.filter').forEach(x => x.onclick = () => {
  $$('.filter').forEach(y => y.classList.remove('active'));
  x.classList.add('active');
  filter = x.dataset.filter;
  render();
});

$('#clearAll').onclick = () => {
  if (firebaseReady) return alert('Cloud data is protected. Use the Firebase console or a future admin-delete feature.');
  if (confirm('Clear all demo bookings?')) {
    bookings = [];
    saveLocal();
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');

let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  $('#installBtn').classList.remove('hidden');
});

$('#installBtn').onclick = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
  }
};

initFirebase();
updateAuthUI();
render();

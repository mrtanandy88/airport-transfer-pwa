import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, collection, query, where, onSnapshot, getDoc, doc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

let stopBookings = null;
let refreshTimer = null;
const profileCache = new Map();

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\'\"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

async function getProfile(db, uid) {
  if (!uid) return null;
  if (profileCache.has(uid)) return profileCache.get(uid);
  try {
    const snap = await getDoc(doc(db, 'driverPublicProfiles', uid));
    const profile = snap.exists() ? snap.data() : null;
    profileCache.set(uid, profile);
    return profile;
  } catch (e) {
    console.error('Customer driver profile enhancement failed:', e);
    return null;
  }
}

async function enhanceCustomerCards(bookings) {
  const accepted = bookings.filter(b => b.status === 'Accepted' && b.driverUid);
  if (!accepted.length) return;

  for (const booking of accepted) {
    const profile = await getProfile(db, booking.driverUid);
    if (!profile) continue;

    const cards = [...document.querySelectorAll('#customerBookings .booking')];
    const bookingCard = cards.find(card => card.querySelector('h3')?.textContent?.trim().startsWith(String(booking.id)));
    if (!bookingCard) continue;

    const driverCard = bookingCard.querySelector('.driver-card');
    if (!driverCard) continue;

    driverCard.innerHTML = `
      <h4 class="driver-card-title">Driver assigned</h4>
      <div class="photo-grid">
        <div><img src="${escapeHtml(profile.selfieDataUrl || '')}" alt="Assigned driver"><small>Driver photo</small></div>
        <div><img src="${escapeHtml(profile.carPhotoDataUrl || '')}" alt="Assigned vehicle"><small>Car photo</small></div>
      </div>
      <div class="driver-identification">
        <div class="driver-person">
          <span class="driver-label">DRIVER</span>
          <strong>${escapeHtml(profile.displayName || booking.driver || 'Assigned driver')}</strong>
        </div>
        <div class="vehicle-identification">
          <span class="driver-label">VEHICLE</span>
          <strong>${escapeHtml(profile.carModel || profile.vehicleType || booking.vehicleType || 'Vehicle')}</strong>
          <span>${escapeHtml(profile.vehicleType || booking.vehicleType || '')}${profile.carColor ? ' • ' + escapeHtml(profile.carColor) : ''}</span>
          <b class="plate-display">${escapeHtml(profile.plateNumber || booking.driverPlateNumber || '')}</b>
        </div>
      </div>`;
  }
}

function watchCustomerBookings() {
  if (stopBookings) stopBookings();
  stopBookings = null;
  if (!getApps().length) return;

  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, user => {
    if (stopBookings) stopBookings();
    stopBookings = null;
    if (!user) return;

    const q = query(collection(db, 'bookings'), where('customerUid', '==', user.uid));
    stopBookings = onSnapshot(q, snap => {
      const bookings = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => enhanceCustomerCards(bookings), 100);
    }, error => console.error('Customer booking enhancement listener failed:', error));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', watchCustomerBookings, { once: true });
} else {
  watchCustomerBookings();
}

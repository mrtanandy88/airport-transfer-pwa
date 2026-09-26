import { firebaseConfig } from './firebase-config.js';

const TRIP_LABELS = {
  Accepted: 'Driver accepted your booking',
  OnTheWay: 'Driver On The Way',
  ArrivedPickup: 'Driver has arrived at pickup',
  PickedUp: 'Customer has been picked up',
  ArrivedDestination: 'Driver arrived at destination',
  DroppedOff: 'Customer has been dropped off',
  Completed: 'Trip completed'
};

const TRIP_ICONS = {
  Accepted: '✅',
  OnTheWay: '🚗',
  ArrivedPickup: '📍',
  PickedUp: '👤',
  ArrivedDestination: '🏁',
  DroppedOff: '🛬',
  Completed: '🎉'
};


const NOTIFICATION_STYLE = `
.notification-center{position:fixed;right:14px;top:82px;z-index:9999;font-family:inherit;pointer-events:none}
.notification-actions{display:flex;justify-content:flex-end}
.notification-enable{pointer-events:auto;border:1px solid #cbd5e1;background:#fff;color:#111827;border-radius:999px;padding:9px 13px;font-weight:800;box-shadow:0 8px 24px rgba(15,23,42,.12);font-size:13px}
.notification-enable.enabled{background:#dcfce7;color:#166534;border-color:#86efac}
.notification-enable:disabled{opacity:.65}
.notification-toast{pointer-events:auto;display:flex;gap:10px;align-items:flex-start;max-width:min(380px,calc(100vw - 28px));margin-top:10px;padding:13px 14px;border-radius:16px;background:#111827;color:#fff;box-shadow:0 14px 34px rgba(15,23,42,.25);font-size:14px;line-height:1.4}
.notification-toast.trip{border-left:5px solid #22c55e}
.notification-toast.new-booking{border-left:5px solid #f59e0b;background:#172554}
.notification-toast.success{background:#166534}
.notification-toast.error{background:#991b1b}
.notification-toast button{border:0;background:transparent;color:inherit;font-size:20px;line-height:1;padding:0;cursor:pointer;margin-left:auto}
@media(max-width:640px){.notification-center{top:78px;right:10px}.notification-enable{font-size:12px;padding:8px 11px}.notification-toast{font-size:13px}}
`;
function injectNotificationStyle(){
  if(document.getElementById('notificationStyle')) return;
  const style=document.createElement('style');
  style.id='notificationStyle';
  style.textContent=NOTIFICATION_STYLE;
  document.head.appendChild(style);
}

let auth = null;
let db = null;
let currentUser = null;
let currentRole = null;
let stopBookingListener = null;
let baselineReady = false;
const previousBookings = new Map();

const $ = s => document.querySelector(s);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function injectNotificationUI() {
  if (!document.getElementById('notificationCenter')) {
    const wrap = document.createElement('div');
    wrap.id = 'notificationCenter';
    wrap.className = 'notification-center';
    wrap.innerHTML = '<div class="notification-actions">' +
      '<button id="enableNotificationsBtn" class="notification-enable" type="button">🔔 Enable notifications</button>' +
      '</div>' +
      '<div id="notificationToasts"></div>';
    document.body.appendChild(wrap);
  }

  const button = $('#enableNotificationsBtn');
  if (button && !button.dataset.bound) {
    button.dataset.bound = '1';
    button.addEventListener('click', requestNotifications);
  }
}

function updateNotificationButton() {
  const button = $('#enableNotificationsBtn');
  if (!button) return;

  if (!currentUser || !['customer', 'admin'].includes(currentRole)) {
    button.classList.add('hidden');
    return;
  }

  button.classList.remove('hidden');

  if (!('Notification' in window)) {
    button.textContent = '🔕 Notifications unavailable';
    button.disabled = true;
    return;
  }

  if (Notification.permission === 'granted') {
    button.textContent = '🔔 Notifications enabled';
    button.classList.add('enabled');
    button.disabled = false;
  } else if (Notification.permission === 'denied') {
    button.textContent = '🔕 Notifications blocked';
    button.classList.remove('enabled');
    button.disabled = false;
  } else {
    button.textContent = '🔔 Enable notifications';
    button.classList.remove('enabled');
    button.disabled = false;
  }
}

async function requestNotifications() {
  if (!currentUser || !['customer', 'admin'].includes(currentRole)) return;

  if (!('Notification' in window)) {
    showToast('Notifications are not supported by this browser.', 'error');
    return;
  }

  if (!window.isSecureContext) {
    showToast('Notifications require HTTPS. Please use the GitHub Pages address.', 'error');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    updateNotificationButton();

    if (permission === 'granted') {
      showToast('🔔 Notifications enabled. You will be notified about trip status changes while this PWA is open.', 'success');
    } else if (permission === 'denied') {
      showToast('Notifications were blocked. You can enable them in your browser site settings.', 'error');
    }
  } catch (error) {
    console.error('Notification permission error:', error);
    showToast('Could not enable notifications: ' + error.message, 'error');
  }
}

function showToast(message, type = 'info') {
  injectNotificationUI();
  const container = $('#notificationToasts');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'notification-toast ' + type;
  toast.innerHTML = '<span>' + escapeHtml(message) + '</span><button type="button" aria-label="Close">×</button>';
  container.appendChild(toast);

  toast.querySelector('button').onclick = () => toast.remove();
  setTimeout(() => toast.remove(), 7000);
}

function sendBrowserNotification(title, body, bookingId) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const notification = new Notification(title, {
      body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'airport-transfer-' + bookingId,
      renotify: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      const customer = document.querySelector('[data-go="customer"]');
      if (customer) customer.click();
    };
  } catch (error) {
    console.warn('Browser notification failed:', error);
  }
}

function bookingTitle(booking) {
  return booking.id || booking.docId || 'Airport transfer';
}

function notifyStatusChange(booking, oldBooking) {
  if (!oldBooking) {
    if (currentRole === 'admin' && booking.status === 'Available') {
      const message = '🚨 New airport transfer booking ' + bookingTitle(booking) + ' from ' + (booking.name || 'customer') + '.';
      const route = booking.pickup && booking.destination ? ' ' + booking.pickup + ' → ' + booking.destination + '.' : '';
      showToast(message + route, 'new-booking');
      sendBrowserNotification(
        '🚨 New airport transfer booking',
        bookingTitle(booking) + ' • ' + (booking.name || 'Customer') + (route ? ' • ' + booking.pickup + ' → ' + booking.destination : ''),
        booking.docId || booking.id || 'new-booking'
      );
    }
    return;
  }

  const oldTrip = oldBooking.tripStatus || (oldBooking.status === 'Accepted' ? 'Accepted' : '');
  const newTrip = booking.tripStatus || (booking.status === 'Accepted' ? 'Accepted' : '');

  if (newTrip && newTrip !== oldTrip) {
    const label = TRIP_LABELS[newTrip] || 'Trip status updated';
    const icon = TRIP_ICONS[newTrip] || '🔔';
    const driver = booking.driver ? ' Driver: ' + booking.driver + '.' : '';
    const route = booking.pickup && booking.destination
      ? ' ' + booking.pickup + ' → ' + booking.destination + '.'
      : '';

    const message = icon + ' ' + label + '.' + driver + route;
    showToast(message, 'trip');
    sendBrowserNotification('Airport Transfer • ' + bookingTitle(booking), label + '.' + driver, booking.docId || booking.id || 'trip');
  }

  if (currentRole === 'customer' && oldBooking.status !== booking.status && booking.status === 'Accepted' && newTrip === oldTrip) {
    const message = '✅ Your driver ' + (booking.driver || '') + ' has accepted the booking.';
    showToast(message, 'trip');
    sendBrowserNotification('Driver assigned • ' + bookingTitle(booking), message, booking.docId || booking.id || 'accepted');
  }
}
function handleBookingSnapshot(snap) {
  const next = new Map();

  snap.docs.forEach(doc => {
    const booking = { docId: doc.id, ...doc.data() };
    next.set(doc.id, booking);

    if (baselineReady) {
      notifyStatusChange(booking, previousBookings.get(doc.id));
    }
  });

  previousBookings.clear();
  next.forEach((value, key) => previousBookings.set(key, value));
  baselineReady = true;
}

async function startFirebaseNotifications() {
  try {
    const appModule = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');
    const authModule = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');
    const firestoreModule = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js');

    const app = appModule.initializeApp(firebaseConfig, 'airportTransferNotifications');
    auth = authModule.getAuth(app);
    db = firestoreModule.getFirestore(app);

    authModule.onAuthStateChanged(auth, async user => {
      if (stopBookingListener) {
        stopBookingListener();
        stopBookingListener = null;
      }

      currentUser = user;
      currentRole = null;
      baselineReady = false;
      previousBookings.clear();
      updateNotificationButton();

      if (!user) return;

      try {
        const userSnap = await firestoreModule.getDoc(
          firestoreModule.doc(db, 'users', user.uid)
        );

        if (!userSnap.exists()) return;

        currentRole = userSnap.data().role;
        updateNotificationButton();

        if (currentRole === 'customer') {
          const q = firestoreModule.query(
            firestoreModule.collection(db, 'bookings'),
            firestoreModule.where('customerUid', '==', user.uid)
          );
          stopBookingListener = firestoreModule.onSnapshot(
            q,
            handleBookingSnapshot,
            error => console.warn('Customer notification listener:', error)
          );
        }

        if (currentRole === 'admin') {
          stopBookingListener = firestoreModule.onSnapshot(
            firestoreModule.collection(db, 'bookings'),
            handleBookingSnapshot,
            error => console.warn('Admin notification listener:', error)
          );
        }
      } catch (error) {
        console.warn('Notification profile setup failed:', error);
      }
    });
  } catch (error) {
    console.warn('Notification Firebase setup failed:', error);
  }
}

injectNotificationStyle();
injectNotificationUI();
updateNotificationButton();
startFirebaseNotifications();

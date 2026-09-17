// Firebase configuration for V2.
// Replace the placeholder values with your Firebase Web App configuration.
// Get these values from Firebase Console -> Project settings -> Your apps -> Web app.
export const firebaseConfig = {
  apiKey: 'PASTE_API_KEY_HERE',
  authDomain: 'PASTE_PROJECT_ID.firebaseapp.com',
  projectId: 'PASTE_PROJECT_ID_HERE',
  storageBucket: 'PASTE_STORAGE_BUCKET_HERE',
  messagingSenderId: 'PASTE_MESSAGING_SENDER_ID_HERE',
  appId: 'PASTE_APP_ID_HERE'
};

export const firebaseConfigured = !firebaseConfig.apiKey.startsWith('PASTE_') && !firebaseConfig.projectId.startsWith('PASTE_');

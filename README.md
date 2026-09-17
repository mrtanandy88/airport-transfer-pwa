# Airport Transfer PWA — V2 RM0 MVP

V2 adds the core structure for a real multi-user system:
- Customer account + airport-transfer booking
- Driver account + available jobs
- Driver private unavailable schedules
- Admin role check
- Firebase Authentication + Firestore-ready data model
- GitHub Pages PWA hosting
- Local demo fallback when Firebase is not configured

## Current status
The site is live on GitHub Pages, but Firebase is intentionally left unconfigured until a Firebase project is connected. Until then, the app uses browser demo data.

## Connect Firebase
1. Create a Firebase project.
2. Add a Web app in Firebase Project settings.
3. Enable Authentication → Email/Password.
4. Create a Firestore database.
5. Copy the Web app configuration values into `js/firebase-config.js`.
6. Publish `firestore.rules` from the Firebase Console.
7. Create the first admin account with the normal customer sign-up, then change that user's `role` field to `admin` in Firestore. This should only be done by the project owner.
8. Refresh the GitHub Pages site.

## Firestore collections
- `users/{uid}` — email and role (`customer`, `driver`, `admin`)
- `bookings/{id}` — customer booking and driver assignment
- `driverSchedules/{id}` — driver unavailable date/time windows

## Important
Firebase web configuration values are not passwords or service-account credentials. Never put a Firebase service-account private key or other secret credentials in this public repository.

## Next build stages
1. Firebase connection and real-time listeners
2. Customer booking history/status notifications
3. Driver matching based on language, schedule, capacity and location
4. Admin driver management and assignment/reassignment
5. Maps/location selection
6. Push notifications and production hardening

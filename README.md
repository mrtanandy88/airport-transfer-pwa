# Airport Transfer PWA — V2 RM0 MVP

V2 is a multi-user PWA foundation for airport-transfer bookings:
- Customer account + airport-transfer booking
- Driver account + available jobs
- Driver private unavailable schedules
- Admin role check
- Firebase Authentication + Cloud Firestore
- Real-time booking/schedule listeners
- GitHub Pages PWA hosting
- Local demo fallback if Firebase cannot be started

## Current Firebase setup
The repository is connected to the Firebase web project `airport-transfer-pwa` through `js/firebase-config.js`.

Firebase services that must be enabled in the Firebase Console:
1. Authentication → Email/Password
2. Cloud Firestore → `(default)` database in `asia-southeast1 (Singapore)`
3. Authentication → Settings → Authorized domains → `mrtanandy88.github.io`
4. Firestore Rules → publish the contents of `firestore.rules`

The client app configuration is intended to be public in a browser app. Never put Firebase service-account private keys, passwords, or other server secrets in this repository.

## Roles
- `customer`: can create and read their own bookings
- `driver`: can read available jobs, accept jobs, complete their accepted jobs, and manage their own unavailable schedules
- `admin`: can read/manage all bookings and driver schedules

The client never offers an admin sign-up. To create the first admin, create a normal customer account and then, as the project owner, change that user's `role` field from `customer` to `admin` in Firestore.

## Firestore collections
- `users/{uid}` — email and role (`customer`, `driver`, `admin`)
- `bookings/{id}` — customer booking, status and driver assignment
- `driverSchedules/{id}` — driver unavailable date/time windows

## Important
The app uses Firestore security rules for access control. The `firestore.rules` file in GitHub is a source file; it is **not automatically published to Firebase** just because it is stored in this repository. Publish those rules in Firebase Console before testing cloud bookings.

## Next build stages
1. Test customer and driver accounts on different phones
2. Customer booking history and status notifications
3. Driver matching based on language, schedule, vehicle capacity and location
4. Admin driver management and assignment/reassignment
5. Maps/location selection
6. Push notifications and production hardening

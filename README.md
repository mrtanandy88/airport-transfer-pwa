# Airport Transfer PWA — RM0 MVP

This is the simplest working prototype:
Customer creates booking → booking appears on Driver Job Board → Driver accepts → Admin sees status.

## Important
This first version stores data in browser localStorage. It is ideal for UI/testing but is NOT yet a multi-user production system. For real customers and drivers on different phones, connect Firebase/another backend in the next step.

## GitHub Pages
1. Create a GitHub repository.
2. Upload all files/folders from this project.
3. Repository Settings → Pages.
4. Choose GitHub Actions or Deploy from branch, depending on the Pages options shown.
5. Publish the site.
6. Open the generated github.io address on Android Chrome and use “Add to Home screen”.

## Next production step
Replace localStorage with Firebase Firestore + Authentication, then add separate customer/driver/admin roles and real-time booking updates.

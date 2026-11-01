Bhutan Clinical Reference — installable app (PWA)
Developed by Dr Deo Raj Suberi, GDMO, Reg. No. MM711

Files: index.html (the app), manifest.webmanifest + sw.js + icons (installable/offline), firebase-sdk.js (sign-in & chat library),
firebase-config.js (PASTE YOUR FIREBASE SETTINGS HERE), firestore.rules (paste into Firestore -> Rules).

Put this whole folder on any HTTPS web host (for example GitHub Pages), open the address in Chrome on Android,
then tap "Install app" (or menu ⋮ → Install app / Add to Home screen). After the first visit it works offline.
To make an APK for sideloading or the Play Store, paste the same address into https://www.pwabuilder.com and choose Android.

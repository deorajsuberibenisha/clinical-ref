// Firebase web-app settings for Bhutan Clinical Reference (project: bhutan-clinical-ref).
// These identify the project; access is controlled by the Firestore security rules.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAh-M2xbx6gIP5JYIm1RnKlxoY8kUqw8tU",
  authDomain: "bhutan-clinical-ref.firebaseapp.com",
  projectId: "bhutan-clinical-ref",
  storageBucket: "bhutan-clinical-ref.firebasestorage.app",
  messagingSenderId: "832549318807",
  appId: "1:832549318807:web:c6bdea2272cfc8b89fb9d2"
};

// Keyboard fix (1 Nov 2026): name, email and password boxes use the normal letter keyboard.
document.addEventListener("DOMContentLoaded", function () {
  var fix = function () { document.querySelectorAll('input[inputmode="decimal"]').forEach(function (i) { if (i.type === "text" || i.type === "email" || i.type === "password" || i.type === "search") { if (!/^pat_/.test(i.id)) i.removeAttribute("inputmode"); } }); };
  fix();
  new MutationObserver(fix).observe(document.body, {childList: true, subtree: true});
});

// Wait for Firebase to load, then initialize everything

let firebaseReady = false;
let initAttempts = 0;

function initializeApp() {
  if(typeof firebase === 'undefined') {
    initAttempts++;
    if(initAttempts > 50) {
      console.error('Firebase failed to load after 5 seconds');
      return;
    }
    setTimeout(initializeApp, 100);
    return;
  }

  if(firebaseReady) return;
  firebaseReady = true;

  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    db.settings({merge:true});
    console.log('Firebase initialized');
  } catch(e) {
    console.log('Firebase already initialized:', e.message);
  }
}

// Start checking for Firebase
initializeApp();

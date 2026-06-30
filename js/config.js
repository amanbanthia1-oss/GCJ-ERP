// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCihGiK-yRDmQ7STS6UDZL_fpzakhBVR7c",
  authDomain: "gcj-inventory-52d2a.firebaseapp.com",
  projectId: "gcj-inventory-52d2a",
  storageBucket: "gcj-inventory-52d2a.firebasestorage.app",
  messagingSenderId: "1033965450551",
  appId: "1:1033965450551:web:66e3532cd24f84e97d56b2",
  measurementId: "G-LG7J8FYBBZ"
};

// Wait for Firebase to load
if(typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
} else {
  console.log('Firebase loading...');
}

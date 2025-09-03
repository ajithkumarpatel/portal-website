import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_5I3yvsRGV7PIb5GXTTeT_qICcZxm7oc",
  authDomain: "academic-portal-c31a3.firebaseapp.com",
  projectId: "academic-portal-c31a3",
  storageBucket: "academic-portal-c31a3.appspot.com",
  messagingSenderId: "819877709580",
  appId: "1:819877709580:web:9e3e32a10eb7582e13eb29"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const app = firebase; // for compatibility with v8 style
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err: any) => {
    if (err.code == 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code == 'unimplemented') {
      console.warn("The current browser does not support all of the features required to enable persistence.");
    }
  });


export { auth, db, app as firebase };
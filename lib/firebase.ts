// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARNiXCCoOl_sbTEy5j_TN3s-r8vnijWOg",
  authDomain: "didactic-guide.firebaseapp.com",
  projectId: "didactic-guide",
  storageBucket: "didactic-guide.appspot.com",
  messagingSenderId: "571100157840",
  appId: "1:571100157840:web:56c224b8d3883b74010515",
  measurementId: "G-J1VQ6YRV4D"
};


// Initialize Firebase 
if (!firebase.app.length) {
    const app = firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
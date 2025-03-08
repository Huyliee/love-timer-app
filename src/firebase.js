// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUSalSutYeaHIBfGaGD2ZsH6uKqH0V-pI",
  authDomain: "love-timer-app.firebaseapp.com",
  projectId: "love-timer-app",
  storageBucket: "love-timer-app.firebasestorage.app",
  messagingSenderId: "1087483957266",
  appId: "1:1087483957266:web:9636b9b9852a8e19e788cb",
  measurementId: "G-R8XP9GDRPL"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 👈 THÊM DÒNG NÀY

const firebaseConfig = {
  apiKey: "AIzaSyAg6_1youLoG83BhHb_TSWI8Ma8wRRCWbE",
  authDomain: "diemdanh-bantru-e5e43.firebaseapp.com",
  projectId: "diemdanh-bantru-e5e43",
  storageBucket: "diemdanh-bantru-e5e43.appspot.com",
  messagingSenderId: "1063726842881",
  appId: "1:1063726842881:web:9f2b533d9c7ff230beec00",
  measurementId: "G-SK3V1E2SWV"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app); // 👈 THÊM DÒNG NÀY

export { db, auth }; // 👈 CẬP NHẬT DÒNG NÀY

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgPdBHfqfyIou3N0S_dN8Cymy4YwN9xW0",
  authDomain: "entre-dunas.firebaseapp.com",
  projectId: "entre-dunas",
  storageBucket: "entre-dunas.firebasestorage.app",
  messagingSenderId: "719905959633",
  appId: "1:719905959633:web:8b45b1765d7fd22bbd9ff0"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

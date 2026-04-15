import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAetP3b-yn7X8Q3WUicKdvp__zWlXGLiEU",
  authDomain: "opsverai.firebaseapp.com",
  projectId: "opsverai",
  storageBucket: "opsverai.firebasestorage.app",
  messagingSenderId: "596842357400",
  appId: "1:596842357400:web:6afcc6525ae29a2866a6ed",
  measurementId: "G-Z9ZYDBM0JR",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// Analytics is optional and only available in supported browser environments.
if (typeof window !== "undefined") {
  void isSupported()
    .then((supported) => {
      if (supported) getAnalytics(firebaseApp);
    })
    .catch(() => {
      // Ignore analytics init failures in unsupported environments.
    });
}

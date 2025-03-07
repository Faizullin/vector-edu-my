import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "./login.scss";
import axios from "axios";

export default function Login() {
  const firebaseConfig = {
    apiKey: "AIzaSyDW-QH02jaj-5B31y81P3YNoVO7ygNgtYs",
    authDomain: "vector-education-7d992.firebaseapp.com",
    projectId: "vector-education-7d992",
    storageBucket: "vector-education-7d992.appspot.com",
    messagingSenderId: "392312821607",
    appId: "1:392312821607:web:9602635709bd45bee981c2",
    measurementId: "G-5C6F62RMX9",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const signIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        console.log(credential?.idToken);

        axios
          .post("http://127.0.0.1:8000/api_users/firebase/auth/", {
            token: credential?.idToken,
          })
          .then((response) => console.log("resp", response))
          .catch((err) => console.log("err", err));
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage, email, credential);
      });
  };
  return (
    <div>
      <button onClick={signIn}>Войти с помощью Google</button>
    </div>
  );
}

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "xxx",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  appId: "xxx",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

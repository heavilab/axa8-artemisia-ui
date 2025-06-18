"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  getAuth,
  User as FirebaseUser,
} from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);

export function useUser() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

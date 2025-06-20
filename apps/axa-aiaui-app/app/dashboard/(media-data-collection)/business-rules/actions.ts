"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export async function deleteSetById(setId: string) {
  const colRef = collection(db, "businessRules");
  const q = query(colRef, where("setId", "==", setId));
  const snapshot = await getDocs(q);

  const deletions = snapshot.docs.map((docSnap) =>
    deleteDoc(doc(db, "businessRules", docSnap.id))
  );
  await Promise.all(deletions);
}

"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  addDoc,
  getDoc,
  FieldValue,
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

/**
 * Publishes a draft as main for a given setId and scope (country, entity, agency).
 *
 * Steps:
 * 1. Find all draft rules for the draft scope in the draft set.
 * 2. Find all main rules for all scopes.
 * 3. Set all previous main rules (for all scopes) to deprecated.
 * 4. Set all draft rules for the draft scope to main and update publishedAt.
 * 5. For all other-scope main rules, duplicate them as new main rules.
 */
export async function publishDraftAsMain({
  draftSetId,
  country,
  entity,
  agency,
}: {
  draftSetId: string;
  country: string;
  entity: string;
  agency: string;
}) {
  const colRef = collection(db, "businessRules");

  // 1. Find all rules in the draft set
  const draftSnapshot = await getDocs(
    query(colRef, where("setId", "==", draftSetId))
  );
  const draftRules = draftSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Record<string, unknown>),
  }));

  // 1. Find all draft rules for the draft scope in the draft set
  const draftScopeRules = draftRules.filter((rule) => {
    const r = rule as Record<string, unknown>;
    return r.country === country && r.entity === entity && r.agency === agency;
  });

  // 2. Find all main rules for all scopes
  const allMainSnapshot = await getDocs(
    query(colRef, where("status", "==", "main"))
  );
  const allMainRules = allMainSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Record<string, unknown>),
  }));

  // 3. Find all main rules for other scopes (not the draft scope)
  const otherScopeMainRules = allMainRules.filter((rule) => {
    const r = rule as Record<string, unknown>;
    return r.country !== country || r.entity !== entity || r.agency !== agency;
  });

  // 4. Set all previous main rules (for all scopes) to deprecated
  for (const docSnap of allMainSnapshot.docs) {
    await updateDoc(doc(db, "businessRules", docSnap.id), {
      status: "deprecated",
    });
  }

  // 5. Set all draft rules for the draft scope to main and update publishedAt
  for (const rule of draftScopeRules) {
    await updateDoc(doc(db, "businessRules", (rule as { id: string }).id), {
      status: "main",
      publishedAt: Timestamp.now(),
      setId: draftSetId,
    });
  }

  // 6. For all other-scope main rules, duplicate them as new main rules
  for (const rule of otherScopeMainRules) {
    if (typeof rule === "object" && rule !== null) {
      const data = Object.fromEntries(
        Object.entries(rule).filter(([k]) => k !== "id")
      );
      Object.assign(data, {
        setId: draftSetId,
        status: "main",
        publishedAt: Timestamp.now(),
      });
      await addDoc(colRef, data);
    }
  }
}

/**
 * Updates a business rule draft row by id. Only allows editing if the rule's status is 'draft'.
 */
export async function updateDraftRuleById(
  ruleId: string,
  updates: { [key: string]: FieldValue | Partial<unknown> | undefined }
) {
  const ruleRef = doc(db, "businessRules", ruleId);
  const ruleSnap = await getDoc(ruleRef);
  if (!ruleSnap.exists()) throw new Error("Rule not found");
  const ruleData = ruleSnap.data();
  if (ruleData.status !== "draft") {
    throw new Error("Only draft rules can be edited");
  }
  await updateDoc(ruleRef, updates);
}

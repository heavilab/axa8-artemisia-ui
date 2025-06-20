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
 * 1. Copy all data on other scopes than the current scope in the current draft into the draft (duplicate them into the draft set).
 * 2. Set the current main to deprecated (status = 'deprecated').
 * 3. Add publishedAt = now in the draft.
 * 4. Set the draft status to main.
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

  // 2. Find all rules in the main set for the same country/entity/agency
  const mainSnapshot = await getDocs(
    query(
      colRef,
      where("status", "==", "main"),
      where("country", "==", country),
      where("entity", "==", entity),
      where("agency", "==", agency)
    )
  );
  const mainRules = mainSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 3. Copy all data on other scopes than the current scope in the current draft into the draft
  //    (i.e., for all rules in the draft set that are NOT for the current country/entity/agency, duplicate them into the draft set)
  const otherScopeDraftRules = draftRules.filter((rule) => {
    const r = rule as Record<string, unknown>;
    return r.country !== country || r.entity !== entity || r.agency !== agency;
  });
  // No-op if there are no other-scope rules, but if there are, duplicate them into the draft set
  for (const rule of otherScopeDraftRules) {
    // Duplicate the rule into the draft set (with a new doc)
    if (typeof rule === "object" && rule !== null) {
      const data = Object.fromEntries(
        Object.entries(rule).filter(([k]) => k !== "id")
      );
      Object.assign(data, {
        setId: draftSetId,
        status: "draft",
        createdAt: Timestamp.now(),
      });
      await addDoc(colRef, data);
    }
  }

  // 4. Set the current main to deprecated
  for (const mainRule of mainRules) {
    await updateDoc(doc(db, "businessRules", mainRule.id), {
      status: "deprecated",
    });
  }

  // 5. Update all draft rules in the draft set to main and set publishedAt
  for (const draftRule of draftRules) {
    await updateDoc(doc(db, "businessRules", draftRule.id), {
      status: "main",
      publishedAt: Timestamp.now(),
    });
  }
}

/**
 * Updates a business rule draft row by id. Only allows editing if the rule's status is 'draft'.
 */
export async function updateDraftRuleById(
  ruleId: string,
  updates: { [key: string]: any }
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

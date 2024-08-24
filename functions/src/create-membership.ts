import { getFirestore } from "firebase-admin/firestore";
import { kMembershipsPath } from "./consts";

export async function createMembership(
  bandId: string,
  userId: string
): Promise<string> {
  const db = getFirestore();

  const collectionRef = db.collection(kMembershipsPath);

  const membershipId = await collectionRef.add({
    musicianId: userId,
    bandId: bandId,
    roleId: "founder",
  });

  return membershipId.id;
}

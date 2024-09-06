import { getFirestore, QuerySnapshot } from "firebase-admin/firestore";

export async function getMembershipsByBandId(
  bandId: string
): Promise<QuerySnapshot> {
  const db = getFirestore();
  return await db.collection("memberships").where("bandId", "==", bandId).get();
}
export async function getMembershipsByMusicianId(
  musicianId: string
): Promise<QuerySnapshot> {
  const db = getFirestore();
  return await db
    .collection("memberships")
    .where("musicianId", "==", musicianId)
    .get();
}

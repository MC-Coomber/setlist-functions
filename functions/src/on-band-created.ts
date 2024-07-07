import {
  DocumentReference,
  FieldValue,
  getFirestore,
  WriteResult,
} from "firebase-admin/firestore";

export async function onBandCreated(userId: string, bandId: string) {
  // Create membership
  const memmbershipId = await createMembership(bandId, userId);
  // Update user
  // Update band

  Promise.all([
    updateBand(bandId, memmbershipId),
    updateMusician(userId, memmbershipId),
  ]);
}

async function createMembership(
  bandId: string,
  userId: string
): Promise<string> {
  const db = getFirestore();

  const collectionRef = db.collection("memberships");

  const membershipId = await collectionRef.add({
    musicianId: userId,
    bandId: bandId,
    role: {
      name: "founder",
      permissions: {
        canAddMembers: true,
        canRemoveMembers: true,
      },
    },
  });

  return membershipId.id;
}

async function updateMusician(
  userId: string,
  membershipId: string
): Promise<WriteResult> {
  const db = getFirestore();

  const docRef = db.collection("musicians").doc(userId);

  return updateMembership(docRef, membershipId);
}

async function updateBand(
  bandId: string,
  membershipId: string
): Promise<WriteResult> {
  const db = getFirestore();

  const docRef = db.collection("bands").doc(bandId);

  return updateMembership(docRef, membershipId);
}

async function updateMembership(
  docRef: DocumentReference,
  membershipId: string
): Promise<WriteResult> {
  return docRef.update({
    memberships: FieldValue.arrayUnion(membershipId),
  });
}

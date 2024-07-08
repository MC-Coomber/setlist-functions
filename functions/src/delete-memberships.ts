import { Firestore, getFirestore, Query } from "firebase-admin/firestore";
import { kMembershipsPath } from "./consts";
import { log } from "firebase-functions/logger";

export async function deleteBandMemberships(bandId: string) {
  const db = getFirestore();

  const query = db.collection(kMembershipsPath).where("bandId", "==", bandId);
  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(
  db: Firestore,
  query: Query,
  resolve: (value?: any) => void
) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    log(`All memberships deleted`);
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    log(`Deleted ${doc.id}`);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

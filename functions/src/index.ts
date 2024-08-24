/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import {
  onDocumentCreatedWithAuthContext,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";

import { error } from "firebase-functions/logger";
import { createMembership } from "./create-membership";
import { deleteBandMemberships } from "./delete-memberships";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

exports.bandcreated = onDocumentCreatedWithAuthContext(
  "bands/{bandId}",
  async (event) => {
    if (event.data && event.authId) {
      createMembership(event.data.id, event.authId);
    } else {
      error("Data or auth ID is not defined");
    }
  }
);

exports.banddeleted = onDocumentDeleted("bands/{bandId}", async (event) => {
  if (event.data) {
    deleteBandMemberships(event.data.id);
  } else {
    error("Data or auth ID is not defined");
  }
});

exports.membershipdeleted = onDocumentDeleted(
  "memberships/{membershipId}",
  async (event) => {
    if (event.data) {
      const db = getFirestore();
      const membership = event.data;
      const bandId = membership.data()!.bandId;
      const bandMemberships = await db
        .collection("memberships")
        .where("bandId", "==", bandId)
        .get();
      if (bandMemberships.size === 0) {
        const band = await db.collection("bands").doc(bandId).get();
        if (band.exists) {
          await db.collection("bands").doc(bandId).delete();
        }
      }
    } else {
      error("Data or auth ID is not defined");
    }
  }
);

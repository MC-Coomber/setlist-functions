import { initializeApp } from "firebase-admin/app";
import {
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

import { error } from "firebase-functions/logger";
import { deleteBandMemberships } from "./delete-memberships";
import { getFirestore } from "firebase-admin/firestore";
import { getMembershipsByBandId, getMembershipsByMusicianId } from "./queries";

initializeApp();

exports.bandupdated = onDocumentUpdated("bands/{bandId}", async (event) => {
  if (event.data) {
    const memberships = await getMembershipsByBandId(event.data.after.id);
    memberships.docs.forEach((membership) => {
      membership.ref.update({
        bandName: event.data?.after.get("name"),
      });
    });
  } else {
    error("Data is not defined");
  }
});

exports.musicianupdated = onDocumentUpdated(
  "musicians/{musicianId}",
  async (event) => {
    if (event.data) {
      const memberships = await getMembershipsByMusicianId(event.data.after.id);
      memberships.docs.forEach((membership) => {
        membership.ref.update({
          musicianName: event.data?.after.get("name"),
        });
      });
    } else {
      error("Data is not defined");
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
      const bandMemberships = await getMembershipsByBandId(bandId);

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

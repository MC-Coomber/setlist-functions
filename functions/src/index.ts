/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import { onDocumentCreatedWithAuthContext } from "firebase-functions/v2/firestore";

import { error } from "firebase-functions/logger";
import { onBandCreated } from "./on-band-created";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

initializeApp();

exports.bandcreated = onDocumentCreatedWithAuthContext(
  "bands/{bandId}",
  async (event) => {
    if (event.data && event.authId) {
      onBandCreated(event.authId, event.data.id);
    } else {
      error("Data or auth ID is not defined");
    }
  }
);

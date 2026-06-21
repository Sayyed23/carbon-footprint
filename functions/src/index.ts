import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export { calculateFootprint } from "./calculateFootprint";
export { parseActivityText } from "./parseActivityText";
export { parseUtilityBill } from "./parseUtilityBill";
export { weeklyDigest } from "./weeklyDigest";

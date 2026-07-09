const admin = require("firebase-admin");

function getFirebaseApp() {
  if (admin.apps.length) return admin.apps[0];

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

function getFirestore() {
  getFirebaseApp();
  return admin.firestore();
}

module.exports = { getFirebaseApp, getFirestore };

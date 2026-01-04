// firebase.js
const admin = require('firebase-admin');
const webpush = require('web-push');
require('dotenv').config();

try {
  const serviceAccountEncoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountEncoded) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set.');
  const serviceAccount = JSON.parse(Buffer.from(serviceAccountEncoded, 'base64').toString('utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized successfully.");

  // Configure web-push
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log("web-push configured successfully.");

} catch (error) {
  console.error("FATAL: Could not initialize Firebase/web-push. Check environment variables and service account file.", error.message);
}

const sendPushNotification = async (tokens, title, body) => {
  if (!admin.apps.length) {
    console.error("Firebase not initialized. Cannot send push notification.");
    return;
  }
  if (!tokens || tokens.length === 0) {
    return;
  }

  const payload = JSON.stringify({
    title,
    body,
    icon: '/pwa-192x192.png' // Icon shown in the notification
  });

  const promises = tokens.map(tokenObj => {
    try {
      const subscription = JSON.parse(tokenObj.token);
      return webpush.sendNotification(subscription, payload).catch(error => {
        console.error(`Error sending push to a token, might be expired: ${error.statusCode}`);
        // TODO: In a real app, you would delete expired tokens from your DB here.
      });
    } catch (e) {
      console.error("Failed to parse push token subscription:", tokenObj.token);
      return Promise.resolve();
    }
  });

  await Promise.all(promises);
  console.log(`Attempted to send ${tokens.length} push notifications.`);
};

module.exports = { sendPushNotification };

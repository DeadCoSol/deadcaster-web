import admin from 'firebase-admin';
import * as process from 'process';


const serviceAccountKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(serviceAccountKey);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
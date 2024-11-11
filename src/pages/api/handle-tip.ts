import type { NextApiRequest, NextApiResponse } from 'next';
import * as firebaseAdmin from 'firebase-admin';
import { adminDb } from '@lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('API route hit');
    if (req.method === 'POST') {
        const { userId, tweetId, token, deadCoAmount } = req.body;

        console.log(`User ${userId} tipping tweet ${tweetId} ${deadCoAmount}.`);

        try {
            // Verify the authentication token
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            const authenticatedUserId = decodedToken.uid;

            if (authenticatedUserId !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const userDocRef = adminDb.collection('users').doc(userId);
            const tipRef = userDocRef.collection('tips');

            //create a user transaction to let our back end google function do the transfer
            const userTransaction = {
                userId,  // userId that caused the notification, yes we have it from the owning user as well
                tweetId, // the tweet it's associated too
                deadCoAmount,
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                status: 'PROCESSING' //PROCESSING, ERROR, COMPLETE
            };

            await adminDb.runTransaction(async (transaction) => {
                // commit the transaction in the sub collection
                transaction.set(tipRef.doc(), userTransaction);
            });
            console.log(`User tip transaction created for user ${userId}. Update function will process it.`);

            res.status(200).json({ success: true });
        } catch (error) {
            console.log('Error handling tip:', error);
            // @ts-ignore
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

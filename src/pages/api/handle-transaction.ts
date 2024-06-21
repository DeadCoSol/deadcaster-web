import type { NextApiRequest, NextApiResponse } from 'next';
import * as firebaseAdmin from 'firebase-admin';
import { adminDb } from '@lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId, amount, paymentSecret, token, deadCoAmount } = req.body;

        try {
            // Verify the authentication token
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            const authenticatedUserId = decodedToken.uid;

            if (authenticatedUserId !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const snapshot = await adminDb.collectionGroup('payment_intents')
                .where('secret', '==', paymentSecret)
                .where('status', '==', 'OPEN')
                .limit(1)
                .get();

            if (snapshot.empty) {
                return res.status(404).json({ success: false, message: 'Payment intent not found' });
            }

            const paymentIntentDoc = snapshot.docs[0];
            const paymentIntentData = paymentIntentDoc.data();

            //switch this intent to processing to avoid multiple requests for the same intent
            await adminDb.runTransaction(async (transaction) =>
            {
                transaction.update(paymentIntentDoc.ref, {
                    status: 'PROCESSING'
                })
            })

            console.log(`Payment ${paymentIntentData.status} amount ${amount} for user ${userId}`);

            const userDocRef = adminDb.collection('users').doc(userId);
            const transactionRef = userDocRef.collection('transactions');

            //create a user transaction to let our back end google function do the transfer
            const userTransaction = {
                userId,  // userId that caused the notification, yes we have it from the owning user as well
                type: 'ONLINE_PURCHASE',  // Online purchase
                paymentId: paymentIntentDoc.get("secret"),
                amount,
                deadCoAmount,
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                status: 'PROCESSING' //PROCESSING, ERROR, COMPLETE
            };

            await adminDb.runTransaction(async (transaction) => {
                // commit the transaction in the sub collection
                transaction.set(transactionRef.doc(), userTransaction);
            });
            console.log(`User transaction created for user ${userId}. Update function will process it.`);

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error handling payment success:', error);
            // @ts-ignore
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

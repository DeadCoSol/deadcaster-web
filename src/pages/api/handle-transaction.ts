import type { NextApiRequest, NextApiResponse } from 'next';
import * as firebaseAdmin from 'firebase-admin';
import { adminDb } from '@lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId, amount, paymentId, token } = req.body;

        try {
            // Verify the authentication token
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            const authenticatedUserId = decodedToken.uid;

            if (authenticatedUserId !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            console.log(`Payment ${paymentId.data} amount ${amount} for user ${userId}`);

            const userDocRef = adminDb.collection('users').doc(userId);
            const transactionRef = userDocRef.collection('transactions');

            // const userTransaction = {
            //     userId,  // userId that caused the notification, yes we have it from the owning user as well
            //     type: 'ONLINE_PURCHASE',  // Online purchase
            //     paymentId,
            //     amount,
            //     createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            //     status: 'PENDING' //PENDING, PROCESSING, ERROR, COMPLETE
            // };
            //
            // await adminDb.runTransaction(async (transaction) => {
            //     // Create the transaction in the subcollection
            //     transaction.set(transactionRef.doc(), userTransaction);
            //
            //     // Update the main document field
            //     transaction.update(userDocRef, {
            //         walletNotifications: true
            //     });
            // });
            console.log(`User transaction created ${userId} created. Update function will process it.`);

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

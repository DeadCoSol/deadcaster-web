import type { NextApiRequest, NextApiResponse } from 'next';
import * as firebaseAdmin from 'firebase-admin';
import { adminDb } from '@lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId, mintId: candyMachineId, token } = req.body;

        try {
            // Verify the authentication token
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            const authenticatedUserId = decodedToken.uid;

            if (authenticatedUserId !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            console.log(`Minting with Candy Machine ID ${candyMachineId} for user ${userId}`);

            const userDocRef = adminDb.collection('users').doc(userId);
            const transactionRef = userDocRef.collection('mints');

            //create a user mint to let our back end google function do the transfer
            const userMint = {
                user_id: userId,  // user id that is invoking a mint
                candy_machine_id: candyMachineId,
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                status: 'PROCESSING' //PROCESSING, ERROR, COMPLETE
            };

            await adminDb.runTransaction(async (transaction) => {
                // commit the transaction in the sub collection
                transaction.set(transactionRef.doc(), userMint);
            });
            console.log(`User mint created for user ${userId}. Update function will process it.`);

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error handling mint:', error);
            // @ts-ignore
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

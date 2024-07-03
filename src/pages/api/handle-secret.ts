import type { NextApiRequest, NextApiResponse } from 'next';
import * as firebaseAdmin from 'firebase-admin';
import { adminDb } from '@lib/firebase/admin';
import crypto from 'crypto';
import bs58 from 'bs58';

// @ts-ignore
const decrypt = (text, key) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId, token } = req.body;

        const encryptionKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET!).digest('hex');

        try {
            // Verify the authentication token
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            const authenticatedUserId = decodedToken.uid;

            if (authenticatedUserId !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const userDocRef = adminDb.collection('user_extensions').doc(userId);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
                return res.status(404).json({ success: false, message: 'User extensions not found' });
            }

            const userData = userDoc.data();
            if (!userData) {
                return res.status(400).json({ success: false, message: 'Extensions not found' });
            }

            const encryptedPrivateKey = userData.privateKey;
            const encryptedMnemonic = userData.mnemonic;
            const decryptedPrivateKey = decrypt(encryptedPrivateKey, encryptionKey);
            const decryptedMnemonic = decrypt(encryptedMnemonic, encryptionKey);

            // Should we only let you view it once??
            // await userDocRef.update({ walletViewed: false });

            res.status(200).json({ success: true, privateKey: decryptedPrivateKey, mnemonic: decryptedMnemonic });
        } catch (error) {
            console.error('Error handling request:', error);
            // @ts-ignore
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

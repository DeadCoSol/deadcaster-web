import { NextApiRequest, NextApiResponse } from 'next';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import { adminDb, adminAuth } from '@lib/firebase/admin';

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'chris.deadcaster.xyz';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { userID, token } = req.body;

        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            if (decodedToken.uid !== userID) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
        } catch (error) {
            console.error('Error verifying ID token:', error);
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const user = await adminDb.collection('users').doc(userID).get();
        if (!user.exists) {
            return res.status(400).json({ error: 'User not found' });
        }

        const credentials = user.data()?.credentials || [];

        try {
            const options = await generateAuthenticationOptions({
                rpID,
                allowCredentials: credentials.map((cred: { credentialID: string }) => ({
                    id: new Uint8Array(Buffer.from(cred.credentialID, 'base64')), // Convert to Uint8Array
                    type: 'public-key',
                    transports: ['usb', 'ble', 'nfc', 'internal'],
                })),
                userVerification: 'preferred',
            });

            const challengeToken = jwt.sign({ challenge: options.challenge, userID: userID }, JWT_SECRET, {
                expiresIn: '10m',
            });

            res.status(200).json({ options, token: challengeToken });
        } catch (error) {
            console.error('Error generating authentication options:', error);
            res.status(500).json({ error: 'Failed to generate authentication options' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

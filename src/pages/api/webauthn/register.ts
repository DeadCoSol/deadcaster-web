import { NextApiRequest, NextApiResponse } from 'next';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import { adminDb, adminAuth } from '@lib/firebase/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { userID, token } = req.body;
        console.log("userID ", userID);
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            if (decodedToken.uid !== userID) {
                console.error('Token ID and userID mismatch - Unauthorized');

                return res.status(403).json({ error: 'Token ID and userID mismatch - Unauthorized' });
            }
        } catch (error) {
            console.error('Error verifying ID token:', error);
            return res.status(403).json({ error: 'General Error verifying token Unauthorized' });
        }

        try {
            const options = await generateRegistrationOptions({
                rpName: 'DeadCaster',
                rpID: process.env.NEXT_PUBLIC_RP_ID || 'chris.deadcaster.xyz',
                userID: new Uint8Array(userID), // Convert userID to Uint8Array
                userName: '',
                attestationType: 'none',
                authenticatorSelection: {
                    residentKey: 'required',
                    userVerification: 'preferred',
                },
                // Provide a list of supported algorithms (optional)
                supportedAlgorithmIDs: [-7, -257],
            });

            const challengeToken = jwt.sign({ challenge: options.challenge, userID: userID }, JWT_SECRET, {
                expiresIn: '10m',
            });

            res.status(200).json({ options, token: challengeToken });
        } catch (error) {
            console.error('Error generating registration options:', error);
            res.status(500).json({ error: 'Failed to generate registration options' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import { adminDb, adminAuth } from '@lib/firebase/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

interface RegistrationTokenPayload {
    challenge: string;
    userID: string;
}

const findUser = async (userID: string) => {
    const userDoc = await adminDb.collection('users').doc(userID).get();
    return userDoc.exists ? userDoc.data() : null;
};

const saveUser = async (userID: string, userData: any) => {
    await adminDb.collection('users').doc(userID).set(userData, { merge: true });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { response, token } = req.body;

        let decoded: RegistrationTokenPayload;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as RegistrationTokenPayload;
        } catch (error) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        if (!decoded.challenge || !decoded.userID) {
            return res.status(400).json({ error: 'Invalid token payload' });
        }

        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            if (decodedToken.uid !== decoded.userID) {
                return res.status(403).json({ error: 'Verify ID Token failed - Unauthorized' });
            }
        } catch (error) {
            console.log("error verifying token", error);
            return res.status(403).json({ error: 'General Exception Verifying token -Unauthorized' });
        }

        const user = await findUser(decoded.userID);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: decoded.challenge,
            expectedOrigin: process.env.NEXT_PUBLIC_ORIGIN || 'https://chris.deadcaster.xyz',
            expectedRPID: process.env.NEXT_PUBLIC_RP_ID || 'chris.deadcaster.xyz',
            requireUserVerification: true,
        });

        if (!verification.verified || !verification.registrationInfo) {
            return res.status(400).json({ error: 'Verification failed' });
        }

        const { registrationInfo } = verification;

        const newCredential = {
            credentialID: Buffer.from(registrationInfo.credentialID).toString('base64'),
            credentialPublicKey: Buffer.from(registrationInfo.credentialPublicKey).toString('base64'),
            counter: registrationInfo.counter,
        };

        user.credentials = user.credentials || [];
        user.credentials.push(newCredential);

        await saveUser(decoded.userID, user);

        res.status(200).json({ success: true });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

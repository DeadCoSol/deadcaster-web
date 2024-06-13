import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { adminDb, adminAuth } from '@lib/firebase/admin'; // Use admin SDK

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_ORIGIN || `http://${rpID}`;

interface AuthenticationTokenPayload extends JwtPayload {
    challenge: string;
    userID: string;
}

const findUser = async (userID: string) => {
    const userDoc = await adminDb.collection('users').doc(userID).get();
    return userDoc.exists ? userDoc.data() : null;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { response, token } = req.body;

        let decoded: string | JwtPayload;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as AuthenticationTokenPayload;
        } catch (error) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        if (!decoded.challenge || !decoded.userID) {
            return res.status(400).json({ error: 'Invalid token payload' });
        }

        // Verify the Firebase ID token
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            if (decodedToken.uid !== decoded.userID) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
        } catch (error) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const user = await findUser(decoded.userID);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: decoded.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: user.credentials.find(
                (cred: { credentialID: string }) => cred.credentialID === response.id
            ),
        });

        if (!verification.verified) {
            return res.status(400).json({ error: 'Verification failed' });
        }

        await adminDb.collection('users').doc(decoded.userID).update({
            lastLogin: new Date(),
        });

        res.status(200).json({ success: true });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

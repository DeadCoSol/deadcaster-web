import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import {adminDb} from '@lib/firebase/admin';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId, amount } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ error: 'Missing userId or amount' });
        }

        try {

            // Create a PaymentIntent with the amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // amount in cents
                currency: 'usd',
                metadata: { integration_check: 'accept_a_payment', userId },
            });

            //save the intent so we can check it later to avoid random attempts to claim a successful payment.
            const userRef = adminDb.collection('users').doc(userId);
            const paymentIntentsRef = userRef.collection('payment_intents');

            const userPaymentIntent = {
                id: paymentIntent.id,
                secret: paymentIntent.client_secret,
                status: 'OPEN',
                created_on: admin.firestore.FieldValue.serverTimestamp(),
                amount: amount * 100,
                currency: 'usd',
            }

            // @ts-ignore
            await adminDb.runTransaction(async (transaction) => {
                // Create the intent in the sub collection
                transaction.set(paymentIntentsRef.doc(), userPaymentIntent);
            });

            res.status(200).json({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

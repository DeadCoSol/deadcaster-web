import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

export function useStripePayment() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handlePayment = async (userId: string, amount: string, userName: string) => {
        setLoading(true);

        try {
            // Create payment intent on server
            const { data } = await axios.post('/api/create-payment-intent', {
                amount: Number(amount),
            });

            const { clientSecret } = data;

            console.log('stripe element ', elements?.getElement(CardElement));

            // Confirm card payment on client
            const result = await stripe?.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements?.getElement(CardElement)!,
                    billing_details: {
                        name: userName, // Use the user's name for billing details
                    },
                },
            });

            if (result?.error) {
                console.error('Error confirming card payment:', result.error.message);
                return false;
            }

            // Optionally notify the server about successful payment for further actions
            const successResponse = await axios.post('/api/handle-payment-success', {
                userId,
                amount: Number(amount),
                paymentIntentId: result?.paymentIntent?.id,
            });

            if (successResponse.data.success) {
                return true;
            } else {
                console.error('Error handling payment success:', successResponse.data.error);
                return false;
            }
        } catch (error) {
            console.error('Error during payment process:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { handlePayment, loading };
}

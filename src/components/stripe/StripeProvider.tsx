import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const StripeProvider = ({ children }: { children: React.ReactNode }) => (
    <Elements stripe={stripePromise}>
        {children}
    </Elements>
);

export default StripeProvider;
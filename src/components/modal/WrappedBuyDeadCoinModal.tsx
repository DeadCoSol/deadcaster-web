// components/modal/WrappedBuyDeadCoinModal.tsx
import { useState } from 'react';
import { MainHeader } from '@components/home/main-header';
import { Button } from '@components/ui/button';
import { NextImage } from '@components/ui/next-image';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useDeadCoinPrice } from '@lib/hooks/useDeadCoinPrice';
import type { User } from '@lib/types/user';

export type BuyDeadCoinModalProps = Pick<User, 'id' | 'name'> & {
    closeModal: () => void;
    amount: number;
};

export function WrappedBuyDeadCoinModal({
                                            id,
                                            name,
                                            closeModal,
                                            amount
                                        }: BuyDeadCoinModalProps): JSX.Element {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { price, loading: priceLoading, error: priceError } = useDeadCoinPrice();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success`,
            },
        });

        if (stripeError) {
            setError(stripeError.message || 'An error occurred');
            setLoading(false);
        }
    };

    const deadCoinAmount = price ? (amount / price) * (10 ** 9) : 0;

    // @ts-ignore
    return (
        <>
            <MainHeader
                useActionButton
                disableSticky
                iconName="XMarkIcon"
                tip="Close"
                className="absolute flex w-full items-center gap-6 rounded-tl-2xl"
                title="Checkout"
                action={closeModal}
            />
            <section className="p-6">
                <NextImage
                    src="logo512.jpeg"
                    alt="DeadCoin"
                    width={500}
                    height={170}
                    className="mb-4 mx-auto max-w-full"
                />
                <div className="mb-4 text-center">
                    <p>You are purchasing ${amount} of DeadCoin to use in DeadCaster</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PaymentElement/>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    <div className="pt-4">
                        <Button
                            className="bg-light-primary py-1 px-4 font-bold text-white focus-visible:bg-light-primary/90
                            enabled:hover:bg-light-primary/90 enabled:active:bg-light-primary/80 disabled:brightness-75
                            dark:bg-light-border dark:text-light-primary dark:focus-visible:bg-light-border/90
                            dark:enabled:hover:bg-light-border/90 dark:enabled:active:bg-light-border/75"
                            //type="submit"
                            onClick={() => alert('coming soon!')}
                            disabled={loading || !stripe}
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </Button>
                    </div>
                </form>
                <p className="mt-2 text-sm text-gray-500">
                    A 50 cent service fee will be deducted from the DEADCO transfer.
                </p>
            </section>
        </>
    );
}

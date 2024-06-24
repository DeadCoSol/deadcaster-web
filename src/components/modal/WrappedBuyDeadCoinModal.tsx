import React, {useEffect, useState} from 'react';
import { MainHeader } from '@components/home/main-header';
import { Button } from '@components/ui/button';
import { NextImage } from '@components/ui/next-image';
import {useStripe, useElements, PaymentElement, AddressElement} from '@stripe/react-stripe-js';
import { useDeadCoinPrice } from '@lib/hooks/useDeadCoinPrice';
import type { User } from '@lib/types/user';
import {calculateDeadCoinAmount} from '@lib/utils';

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
    const [deadCoAmount, setDeadCoAmount] = useState<string>("0")

    //we are charging a $1 transaction fee
    useEffect(() => {
        if (!loading) {
            const deadCoinAmount = calculateDeadCoinAmount(amount - 1, price!);
            setDeadCoAmount(deadCoinAmount);
        }
    }, [price]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/wallets?deadco=${deadCoAmount.replaceAll(",", "")}`,
            },
        });

        if (stripeError) {
            setError(stripeError.message || 'An error occurred');
            setLoading(false);
        }
    };

    // @ts-ignore
    return (
        <>
            <MainHeader
                useActionButton
                disableSticky
                iconName="XMarkIcon"
                tip="Close"
                className="absolute flex w-full items-center gap-6 rounded-tl-2xl"
                title="Get DeadCoin"
                action={closeModal}
            />
            <section className="p-6 scroll mt-12">
                <div className="mb-4 text-center text-xl">
                    <p>You are receiving <b>{deadCoAmount}</b> DeadCoin.</p>
                </div>
                <p className="mb-3 text-center text-light-secondary dark:text-dark-secondary">
                    Your ${amount} charge will be from DEADCASTER.XYZ, we charge a $1 service fee.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PaymentElement />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    <div className="pt-4">
                        <Button
                            className="bg-light-primary py-1 px-4 font-bold text-white focus-visible:bg-light-primary/90
                            enabled:hover:bg-light-primary/90 enabled:active:bg-light-primary/80 disabled:brightness-75
                            dark:bg-light-border dark:text-light-primary dark:focus-visible:bg-light-border/90
                            dark:enabled:hover:bg-light-border/90 dark:enabled:active:bg-light-border/75"
                            type="submit"
                            disabled={loading || !stripe}
                        >
                            {loading ? 'Processing...' : 'Get DeadCoin'}
                        </Button>
                    </div>
                </form>
            </section>
        </>
    );
}

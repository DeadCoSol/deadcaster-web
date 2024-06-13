// components/BuyDeadCoin.tsx
import cn from 'clsx';
import { useUser } from '@lib/context/user-context';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { Button } from '@components/ui/button';
import {WrappedBuyDeadCoinModal} from '@components/modal/WrappedBuyDeadCoinModal';
import { useState } from 'react';
import axios from 'axios';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type BuyProps = {
    hide?: boolean;
};

export function BuyDeadCoin({ hide }: BuyProps): JSX.Element {
    const { user } = useUser();
    const { open, openModal, closeModal } = useModal();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [amount, setAmount] = useState(0)

    const handleOpenModal = async (amount: number) => {
        setAmount(amount);
        if (user) {
            try {
                const response = await axios.post('/api/create-payment-intent', {
                    userId: user.id,
                    amount,
                });
                setClientSecret(response.data.clientSecret);
                openModal();
            } catch (error) {
                console.error('Error creating payment intent:', error);
            }
        }
    };

    return (
        <form className={cn(hide && 'hidden md:block')}>
            <Modal
                modalClassName='relative bg-main-background rounded-2xl max-w-xl w-full h-[672px] overflow-hidden'
                open={open}
                closeModal={closeModal}
            >
                {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <WrappedBuyDeadCoinModal id={user ? user.id : ''} name={user ? user.name : 'User Name Unknown'} closeModal={closeModal}  amount={amount}/>
                    </Elements>
                )}
            </Modal>
            <div className="flex items-center">
                <span>Buy DeadCoin:</span>
                <Button
                    className='ml-2 dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                     hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                     dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
                    onClick={() => handleOpenModal(5)}
                >
                    $5
                </Button>
                <Button
                    className='ml-2 dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                     hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                     dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
                    onClick={() => handleOpenModal(10)}
                >
                    $10
                </Button>
                <Button
                    className='ml-2 dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                     hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                     dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
                    onClick={() => handleOpenModal(20)}
                >
                    $20
                </Button>
            </div>
        </form>
    );
}

import cn from 'clsx';
import { useUser } from '@lib/context/user-context';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { Button } from '@components/ui/button';
import {WrappedBuyDeadCoinModal} from '@components/modal/WrappedBuyDeadCoinModal';
import {useState} from 'react';

type BuyProps = {
    hide?: boolean;
};

export function BuyDeadCoin({ hide }: BuyProps): JSX.Element {
    const { user } = useUser();
    const { open, openModal, closeModal } = useModal();
    const [amount, setAmount] = useState<number | null>(null);

    const createPaymentIntent = async (amount: number) => {
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();
            return data.clientSecret;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            return null;
        }
    };

    const handleButtonClick = async (amount: number) => {
        const clientSecret = await createPaymentIntent(amount);
        if (clientSecret) {
            setAmount(amount);
            openModal();
        }
    };

    return (
        <form className={cn(hide && 'hidden md:block')}>
            <Modal
                modalClassName='relative bg-main-background rounded-2xl max-w-xl w-full h-[672px] overflow-hidden'
                open={open}
                closeModal={closeModal}
            >
                {amount && (
                    <WrappedBuyDeadCoinModal
                        id={user ? user.id : ''}
                        name={user ? user.name : 'User Name Unknown'}
                        closeModal={closeModal}
                        amount={amount}
                    />
                )}
            </Modal>
            <label className="mr-2">Buy DeadCoin:</label>
            <Button
                className='dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                   hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                   dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
                onClick={() => handleButtonClick(5)}
            >
                $5
            </Button>
            <Button
                className='dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                   hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                   dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
                onClick={() => handleButtonClick(10)}
            >
                $10
            </Button>
            <Button
                className='dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                   hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                   dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
                onClick={() => handleButtonClick(20)}
            >
                $20
            </Button>
        </form>
    );
}

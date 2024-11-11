import { MainHeader } from '@components/home/main-header';
import React, { useState } from 'react';
import {getToken} from '@lib/firebase/utils';
import axios from 'axios';
import {toast} from 'react-hot-toast';

type TweetTipModalProps = {
    closeModal: () => void;
    tweetId: string;
    userId: string;
};

export function TweetTipModal({ userId, tweetId, closeModal }: TweetTipModalProps): JSX.Element {
    const [selectedAmount, setSelectedAmount] = useState(100); // Default to 100 DeadCoin
    const [customAmount, setCustomAmount] = useState<string>(''); // For custom input

    const handleSelectAmount = (amount: number) => {
        setCustomAmount(''); // Reset custom amount if a predefined amount is selected
        setSelectedAmount(amount);
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAmount(0); // Reset predefined selection when entering custom amount
        setCustomAmount(e.target.value);
    };

    const handleTip = () => {
        // Handle tip logic (e.g., submit selected amount)
        console.log(`${userId} tipping ${selectedAmount || customAmount} DeadCoin for tweet ${tweetId}`);

        const amount = customAmount === '' ? selectedAmount : parseInt(customAmount);
        createTipTransaction(amount).then(r => console.log("tip request sent"))
        // Close modal after tipping
        closeModal();
    };

    const createTipTransaction = async (amount: number) => {
        try {
            const token = await getToken();
            const response =
                await axios.post('/api/handle-tip', { userId, tweetId, token, deadCoAmount: amount });
            if (response.data.success) {
                toast.success("DeadCoin transfer in progress. It can take up to 1 minute.")
            } else {
                toast.error("Error transferring DeadCoin");
            }
        } catch (error) {
            console.error('Failed to send transaction:', error);
        }
    };

    return (
        <>
            <MainHeader
                useActionButton
                disableSticky
                iconName="XMarkIcon"
                tip="Close"
                title="How much?"
                action={closeModal}
            />
            <section className="p-6 scroll mt-7">
                {/* Predefined Tip Options */}
                <div className="flex flex-col items-center mb-4">
                    <div className="flex space-x-4 mb-4">
                        {[100, 1000, 10000, 1000000].map((amount) => (
                            <button
                                key={amount}
                                className={`px-4 py-2 rounded border-b-4 ${
                                    selectedAmount === amount ? 'border-red-500' : 'border-transparent'
                                } bg-blue-500 text-white`}
                                onClick={() => handleSelectAmount(amount)}
                            >
                                {amount.toLocaleString()} DeadCoin
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tip and Cancel Buttons */}
                <div className="flex mt-2 p-5">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
                        onClick={handleTip}
                    >
                        Tip the creator
                    </button>
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </section>
        </>
    );
}

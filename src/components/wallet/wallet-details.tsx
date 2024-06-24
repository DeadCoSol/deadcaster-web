import Tabs from '../ui/tabs';
import TokenRow from './token-row';
import {FaCopy, FaEye, FaEyeSlash} from 'react-icons/fa';
import type { User } from '@lib/types/user';
import { trimAddress, copyToClipboard } from '@lib/utils';
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {getToken} from '@lib/firebase/utils';
import {useUser} from '@lib/context/user-context';
import {toast} from 'react-hot-toast';
import {useStripe} from '@stripe/react-stripe-js';
import {getTokenBalance} from '@lib/solana';

type UserDetailsProps = Pick<User, 'name' | 'wallet' | 'createdAt'>;

function formatNumber(number: number): string {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(0) + 'M'; // Converts to millions and appends 'M'
    } else if (number >= 1000) {
        return (number / 1000).toFixed(0) + 'K'; // Converts to thousands and appends 'K'
    } else {
        return number.toFixed(2); // Returns the number with 9 decimal places
    }
}

export function WalletDetails({ wallet, createdAt }: UserDetailsProps): JSX.Element {
    const stripe = useStripe();
    const { user } = useUser();
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [showKey, setShowKey] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    const previousTxRef = useRef<string | undefined>(user?.lastWalletTransaction);
    const isInitialRender = useRef(true);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            // @ts-ignore
            previousTxRef.current = user?.lastWalletTransaction; // Initialize previousTx on the first render
            return;
        }

        if (user?.lastWalletTransaction !== previousTxRef.current) {
            setMessage("Transaction success.")
            // @ts-ignore
            previousTxRef.current = user?.lastWalletTransaction;
        }
    }, [user?.lastWalletTransaction]);

    useEffect(() => {
        if (wallet && wallet.publicKey) {
            fetchPrivateKey();
        }
    }, [wallet, user]);

    const deadCoAmount = new URLSearchParams(window.location.search).get(
        "deadco"
    );

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    toast.success("Donation received, your DeadCoin is on the way!")
                    setMessage("Donation succeeded, thank you!");
                    paymentTransaction(clientSecret, paymentIntent.amount);
                    break;
                case "processing":
                    toast.loading("Your Donation is processing.")
                    setMessage("Your Donation is processing.");
                    break;
                case "requires_payment_method":
                    toast.error("Your Donation was not successful, please try again.")
                    setMessage("Your Donation was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const fetchPrivateKey = async () => {
        try {
            const token = await getToken();
            const response = await axios.post('/api/handle-secret', { userId: user?.id, token });
            if (response.data.success) {
                setPrivateKey(response.data.privateKey);
                setMnemonic(response.data.mnemonic);
            } else {
                toast.error("error fetching wallet key and mnemonic");
            }
        } catch (error) {
            console.error('Failed to fetch private key:', error);
        }
    };

    const paymentTransaction = async (paymentSecret: string, amount: number) => {
        try {
            const token = await getToken();
            const response =
                await axios.post('/api/handle-transaction', { userId: user?.id, amount, token, paymentSecret, deadCoAmount });
            if (response.data.success) {
                setMessage(" Your DeadCoin transfer is in progress.")
                toast.success("DeadCoin transfer in progress.")
            } else {
                setMessage("We had an issue transferring your DeadCoin. Don't worry we've been notified and will manually process it.")
                toast.error("Error transferring DeadCoin");
            }
        } catch (error) {
            console.error('Failed to send transaction:', error);
        }
    };

    const tokens = wallet?.tokens || [];
    const nfts = wallet?.nfts || [];

    return (
        <>
        <div>
            <div className="flex items-center">
                {message}
            </div>
            <Tabs tabs={['Account', 'NFTs', 'Wallet Details']}>
                <div>
                    {tokens.map((token, index) => (
                        <TokenRow key={index} token={token} />
                    ))}
                </div>
                <div>
                    No NFTs yet.
                </div>
                <div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <div className="flex flex-col items-start">
                                <span className="mr-2">Solana Wallet Public Address:</span>
                                <div className="flex items-center">
                                    <FaCopy
                                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                                        onClick={() => copyToClipboard(wallet ? wallet.publicKey : 'unknown')}
                                        title="Copy address"
                                    />
                                    <span className="mr-2 text-light-secondary dark:text-dark-secondary">{trimAddress(wallet ? wallet.publicKey : 'unknown')}</span>
                                </div>
                            </div>
                        </div>
                        {showKey ? (
                            <div className="mt-2 mb-3">
                                <div className="mt-2">
                                    <div className="flex items-center mb-3">
                                        <span className="mr-2">Do NOT share this!</span>
                                        <FaEyeSlash
                                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowKey(false)}
                                            title="Hide private key"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center mb-3">
                                    <span className="mr-2 text-light-secondary dark:text-dark-secondary">Private Key - {trimAddress(privateKey ? privateKey : 'not available')}</span>
                                    <FaCopy
                                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                                        onClick={() => copyToClipboard(privateKey ? privateKey : 'not available')}
                                        title="Copy private key"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2 text-light-secondary dark:text-dark-secondary">Secret Phrase - {trimAddress(mnemonic ? mnemonic : 'not available')}</span>
                                    <FaCopy
                                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                                        onClick={() => copyToClipboard(mnemonic ? mnemonic : 'not available')}
                                        title="Copy private key"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <span>Private Keys:</span>
                                <div className="flex items-center">
                                    <span className="mr-2">****************</span>
                                    <FaEye
                                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowKey(true)}
                                        title="Show private key"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Tabs>
        </div>
        </>
    );
}

import Tabs from '../ui/tabs';
import TokenRow from './token-row';
import {FaCopy, FaExternalLinkAlt, FaEye, FaEyeSlash} from 'react-icons/fa';
import type { User } from '@lib/types/user';
import { trimAddress, copyToClipboard } from '@lib/utils';
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {getToken} from '@lib/firebase/utils';
import {useUser} from '@lib/context/user-context';
import {toast} from 'react-hot-toast';
import {useStripe} from '@stripe/react-stripe-js';
import {BuyDeadCoin} from '@components/wallet/buy-deadcoin';
import Link from 'next/link';
import {NextImage} from '@components/ui/next-image';
import { useRouter } from 'next/router';

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
    const router = useRouter();
    const stripe = useStripe();
    const { user } = useUser();
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const previousTxRef = useRef<string | undefined>(user?.lastWalletTransaction);
    const isInitialRender = useRef(true);
    const { tab } = router.query;
    const tabIndex = tab === 'buy' ? 2 : tab === 'connect' ? 1 : 0; // 0 for 'Tokens', 1 for 'Connect to Phantom', 2 for 'Buy DeadCoin'

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
                setMnemonic(response.data.mnemonic)
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
                setMessage(" Your DeadCoin transfer is in progress. It can take up to 1 minute. Thank you.")
                toast.success("DeadCoin transfer in progress. It can take up to 1 minute.")
            } else {
                setMessage("We had an issue transferring your DeadCoin. Don't worry we've been notified and will manually process it.")
                toast.error("Error transferring DeadCoin");
            }
        } catch (error) {
            console.error('Failed to send transaction:', error);
        }
    };

    const tokens = wallet?.tokens || [];

    return (
        <>
        <div>
            <div className="flex items-center">
                {message}
            </div>
            <div className="mb-5">
                Your DeadCaster wallet holds tokens you can use to buy collectibles and tip content creators.  Click
                the Buy DeadCoin link to get started.  We use the Solana network to secure and store your tokens.
            </div>
            <div className="flex gap-2 mb-5">
                <Link href={`https://www.solaneyes.com/address/${wallet?.publicKey}`} target='_blank' className='flex'>
                    View your wallet on Solaneyes &nbsp; <FaExternalLinkAlt className='mt-0.5'/>
                </Link>
            </div>
            <Tabs tabs={['Tokens', 'Connect to Phantom', 'Buy DeadCoin']} initialTab={tabIndex}>
                <div>
                    {tokens.map((token, index) => (
                        <TokenRow key={index} token={token} />
                    ))}
                </div>
                <div>
                    <div className="flex flex-col gap-2 mt-5">
                        <div>
                            <div className="mb-1 border-t p-3">
                                <NextImage
                                    useSkeleton
                                    imgClassName='rounded-full'
                                    width={48}
                                    height={48}
                                    src='phantom.jpeg'
                                    alt='Phantom'
                                    key='PhantomWalletPage'
                                />
                                <Link href='https://phantom.app/' target='_blank' className='flex mt-2'>
                                    Get Phantom Wallet &nbsp; <FaExternalLinkAlt className='mt-0.5'/>
                                </Link>
                            </div>

                            <div className="flex justify-between items-center p-3 border-t">
                                To import your wallet into Phantom COPY your "Secret Phrase" by pushing the icon after
                                the label below.  Open Phantom, add a new wallet and select Import from Secret Phrase.
                            </div>
                        </div>
                        <div className="mt-2 p-3">
                            <div className="flex items-center">
                                <span className="mr-2">Secret Phrase: </span>
                                <FaCopy
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                    onClick={() => copyToClipboard(mnemonic ? mnemonic : 'not available')}
                                    title="Copy private key"
                                />
                                <span className="ml-2 text-light-secondary dark:text-dark-secondary">{trimAddress(mnemonic ? mnemonic : 'not available')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <BuyDeadCoin />
                </div>
            </Tabs>
        </div>
        </>
    );
}

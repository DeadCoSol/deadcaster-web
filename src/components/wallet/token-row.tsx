import React, {useEffect, useRef, useState} from 'react';
import {FaCopy, FaExternalLinkAlt, FaSpinner} from 'react-icons/fa';
import {trimAddress} from '@lib/utils';
import {getTokenBalance} from '@lib/solana';
import Link from 'next/link';
import {useUser} from '@lib/context/user-context';

const DEADCOIN_MINT_ADDRESS = 'r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh';

interface TokenRowProps {
    token: {
        associatedAccount: string;
        symbol: string;
        image: string;
        name: string;
    };
}

const TokenRow = ({ token }: TokenRowProps) => {
    const { user } = useUser();
    const [balance, setBalance] = useState<number | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);

    const previousTxRef = useRef<string | undefined>(user?.lastWalletTransaction);
    const isInitialRender = useRef(true);

    //we will use this to indicate that a payment was received and we're transferring the $deadco
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    useEffect(() => {
        if(clientSecret){
            setProcessing(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            // @ts-ignore
            previousTxRef.current = user?.lastWalletTransaction; // Initialize previousTx on the first render
            return;
        }

        if (user?.lastWalletTransaction !== previousTxRef.current) {

            //got tired of fighting the dependency on the useEffect that calls this... todo fix me
            getTokenBalance(token.associatedAccount, DEADCOIN_MINT_ADDRESS)
                .then(setBalance)
                .catch((error) => {
                    console.error('Failed to fetch balance:', error);
                });
            setProcessing(false);
            // @ts-ignore
            previousTxRef.current = user?.lastWalletTransaction;
        }
    }, [user?.lastWalletTransaction]);

    // Function to copy the address to clipboard
    const copyToClipboard = (address: string) => {
        navigator.clipboard.writeText(address)
            .then(() => {
                alert('Address copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    useEffect(() => {
        getTokenBalance(token.associatedAccount, DEADCOIN_MINT_ADDRESS)
                .then(setBalance)
                .catch((error) => {
                    console.error('Failed to fetch balance:', error);
                });
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center p-2 border-b">
                <div className="flex items-center w-1/2">
                    <img src={token.image} alt={token.name} className="w-8 h-8 mr-2 rounded-full" />
                    <div className="text-left">{token.name}</div>
                    {processing ?
                        (<span className="ml-2"><FaSpinner className="spinner"/></span>)
                        : (<span className="ml-2"></span>)
                    }
                </div>
                <div className="flex gap-10 w-1/2 justify-end"> {/* Adjusted gap to 4 for more spacing */}
                    <span className="mr-2">Balance: {balance}</span>
                </div>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
                <div className="flex items-center w-1/2 ml-10">
                    <div className="text-left text-light-secondary dark:text-dark-secondary">Public Address</div>
                </div>
                <div className="flex gap-2 w-1/3 justify-end">
                    <span className="mr-2 text-light-secondary dark:text-dark-secondary">{trimAddress(token.associatedAccount)}</span>
                    <FaCopy
                        className="cursor-pointer text-gray-500 hover:text-gray-700 mt-1"
                        onClick={() => copyToClipboard(token.associatedAccount)}
                        title="Copy address"
                    />
                </div>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
                <div className="flex items-center w-1/2 ml-10">
                    <div className="text-left text-light-secondary dark:text-dark-secondary"></div>
                </div>
                <div className="flex gap-2 w-1/2 justify-end">
                    <Link href={`https://solscan.io/account/${token.associatedAccount}`} target='_blank' className='flex'>
                        View on Solscan &nbsp; <FaExternalLinkAlt className='mt-0.5'/>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TokenRow;

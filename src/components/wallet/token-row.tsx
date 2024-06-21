import React, {useEffect, useState} from 'react';
import {FaCopy, FaExternalLinkAlt} from 'react-icons/fa';
import {trimAddress} from '@lib/utils';
import {getTokenBalance} from '@lib/solana';
import Link from 'next/link';

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
    const [balance, setBalance] = useState<number | null>(null);

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
                </div>
                <div className="flex gap-10 w-1/3 justify-end"> {/* Adjusted gap to 4 for more spacing */}
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

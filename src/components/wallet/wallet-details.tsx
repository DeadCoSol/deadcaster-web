import { UserName } from '../user/user-name';
import Tabs from '../ui/tabs';
import TokenRow from './token-row';
import {FaCopy, FaEye, FaEyeSlash} from 'react-icons/fa';
import type { User } from '@lib/types/user';
import { trimAddress } from '@lib/utils';
import React, { useEffect, useState } from 'react';
import { getTokenBalance } from '@lib/solana';
import axios from 'axios';
import {getToken} from '@lib/firebase/utils';
import {useUser} from '@lib/context/user-context';
import {toast} from 'react-hot-toast';

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
    const { user } = useUser();
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [showKey, setShowKey] = useState<boolean>(false);


    useEffect(() => {
        if (wallet && wallet.publicKey) {
            fetchPrivateKey();
        }
    }, [wallet]);

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

    const copyToClipboard = (address: string) => {
        navigator.clipboard.writeText(address)
            .then(() => {
                alert('Copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    const tokens = wallet?.tokens || [];
    const nfts = wallet?.nfts || [];

    return (
        <>
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
        </>
    );
}

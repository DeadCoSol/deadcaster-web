import { UserName } from '../user/user-name';
import Tabs from '../ui/tabs';
import TokenRow from './token-row';
import { FaCopy } from 'react-icons/fa';
import type { User } from '@lib/types/user';
import { trimAddress } from '@lib/utils';
import React from 'react';

type UserDetailsProps = Pick<User, 'name' | 'wallet' | 'createdAt'>;

function formatNumber(number: number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(0) + 'M'; // Converts to millions and appends 'M'
    } else if (number >= 1000) {
        return (number / 1000).toFixed(0) + 'K'; // Converts to thousands and appends 'K'
    } else {
        return number.toString(); // Returns the number as is if less than 1000
    }
}

export function WalletDetails({
                                  wallet,
                                  createdAt
                              }: UserDetailsProps): JSX.Element {
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

    const tokens = wallet?.tokens || [];
    const nfts = wallet?.nfts || [];

    return (
        <>
            <div>
                <UserName
                    className="-mb-1 text-xl"
                    name={wallet ? 'DeadCoin: ' + formatNumber(wallet?.balance) : 'DeadCoin: 0'}
                    iconClassName="w-6 h-6"
                    verified={false}
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-light-secondary dark:text-dark-secondary">
                    <div className="flex flex-col items-start">
                        <span className="mr-2">Solana Wallet Address:</span>
                        <div className="flex items-center">
                            <span className="mr-2">{trimAddress(wallet ? wallet.publicKey : 'unknown')}</span>
                            <FaCopy
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={() => copyToClipboard(wallet ? wallet.publicKey : 'unknown')}
                                title="Copy address"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Tabs tabs={['Tokens', 'NFTs']}>
                <div>
                    {tokens.map((token, index) => (
                        <TokenRow key={index} token={token} />
                    ))}
                </div>
                <div>
                    {nfts.map((nft, index) => (
                        <div key={index} className="p-2 border-b">
                            {nft.name}
                        </div>
                    ))}
                </div>
            </Tabs>
        </>
    );
}
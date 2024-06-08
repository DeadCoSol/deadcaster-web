import React from 'react';
import { FaCopy, FaPaperPlane, FaArrowDown } from 'react-icons/fa';
import {trimAddress} from '@lib/utils';

interface TokenRowProps {
    token: {
        associatedAccount: string;
        symbol: string;
        image: string;
        name: string;
    };
}

const TokenRow = ({ token }: TokenRowProps) => {
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

    return (
        <div className="flex justify-between items-center p-2 border-b">
            <div className="flex items-center w-1/3">
                <img src={token.image} alt={token.name} className="w-8 h-8 mr-2 rounded-full" />
                <div className="text-left">{token.name}</div>
            </div>
            <div className="text-left w-1/3 flex items-center">
                <span className="mr-2">{trimAddress(token.associatedAccount)}</span>
                <FaCopy
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(token.associatedAccount)}
                    title="Copy address"
                />
            </div>
            <div className="flex gap-10 w-1/3 justify-end"> {/* Adjusted gap to 4 for more spacing */}
                <FaPaperPlane
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    title="Send"
                />
                <FaArrowDown
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    title="Receive"
                />
            </div>
        </div>
    );
};

export default TokenRow;

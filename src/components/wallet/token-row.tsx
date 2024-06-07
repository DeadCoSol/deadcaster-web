import React from 'react';

interface TokenRowProps {
    token: {
        name: string;
        balance: number;
    };
}

const TokenRow = ({ token }: TokenRowProps) => {
    return (
        <div className="flex justify-between items-center p-2 border-b">
            <div className="text-left w-1/3">{token.name}</div>
            <div className="text-left w-1/3">{token.balance}</div>
            <div className="flex gap-2 w-1/3 justify-end">
                <button className="btn">Send</button>
                <button className="btn">Receive</button>
                <button className="btn">Swap</button>
            </div>
        </div>
    );
};

export default TokenRow;

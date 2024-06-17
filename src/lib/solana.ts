import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, TokenAccountNotFoundError } from '@solana/spl-token';

export async function getTokenBalance(publicKey: string, tokenMintAddress: string): Promise<number> {
    try {
        const connection = new Connection(process.env.NEXT_PUBLIC_QUICK_NODE_URL as string, 'confirmed');
        const tokenAccount = new PublicKey(publicKey);
        const tokenMint = new PublicKey(tokenMintAddress);

        const info = await connection.getTokenAccountBalance(tokenAccount);
        if (info.value.uiAmount == null) throw new Error('No balance found');
        console.log('Balance (using Solana-Web3.js): ', info.value.uiAmount);
        return info.value.uiAmount;
    } catch (error) {
        console.error('Error fetching token balance:', error);
        throw error;
    }
}

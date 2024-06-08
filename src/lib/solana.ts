import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, TokenAccountNotFoundError } from '@solana/spl-token';

export async function getTokenBalance(publicKey: string, tokenMintAddress: string): Promise<number> {
    try {
        const connection = new Connection(process.env.NEXT_PUBLIC_QUICK_NODE_URL as string, 'confirmed');
        const publicKeyObj = new PublicKey(publicKey);
        const tokenMint = new PublicKey(tokenMintAddress);

        // Fetch the associated token account for the given mint and owner
        const tokenAccounts = await connection.getTokenAccountsByOwner(publicKeyObj, {
            mint: tokenMint,
        });

        if (tokenAccounts.value.length === 0) {
            throw new TokenAccountNotFoundError();
        }

        const tokenAccount = await getAccount(connection, new PublicKey(tokenAccounts.value[0].pubkey));
        return Number(tokenAccount.amount) / 1e9; // Convert from token's smallest unit to actual token amount
    } catch (error) {
        console.error('Error fetching token balance:', error);
        throw error;
    }
}

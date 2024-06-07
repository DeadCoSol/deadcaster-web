// pages/api/createWallet.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Keypair, Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import * as bip39 from 'bip39';


//todo add our quicknode server via env. variable
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const mnemonic = bip39.generateMnemonic();
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const path = "m/44'/501'/0'/0'";
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const keypair = Keypair.fromSeed(derivedSeed);
        const publicKey = keypair.publicKey.toString();

        res.status(200).json({ mnemonic, publicKey });
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ error: error.message });
    }
};

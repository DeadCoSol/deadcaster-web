import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Modal } from '@components/modal/modal';
import { useWallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Keypair } from '@solana/web3.js';
import axios from 'axios';
import {useAuth} from '@lib/context/auth-context';
import {getToken} from '@lib/firebase/utils';
import * as bip39 from 'bip39';
import * as ed from 'ed25519-hd-key';

type WalletSelectionModalProps = {
    open: boolean;
    closeModal: () => void;
    setBurnerWallet: (wallet: UnsafeBurnerWalletAdapter) => void;
};

export function WalletSelectionModal({
                                         open,
                                         closeModal,
                                         setBurnerWallet
                                     }: WalletSelectionModalProps): JSX.Element {
    const { connect, select } = useWallet();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSelectBurner = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.post('/api/handle-secret', { userId: user?.id, token });
            if (response.data.success) {
                const mnemonic = response.data.mnemonic; // Assuming the mnemonic is returned from the API

                // Convert mnemonic to seed
                const seed = await bip39.mnemonicToSeed(mnemonic);

                // Derive the keypair using the standard derivation path for Solana
                const derivedSeed = ed.derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
                const keypair = Keypair.fromSeed(derivedSeed);

                const burnerWalletAdapter = new UnsafeBurnerWalletAdapter();
                setBurnerWallet(burnerWalletAdapter);
                await burnerWalletAdapter.connect(); // Automatically connect the burner wallet
                closeModal();
            } else {
                console.error("Error fetching wallet key and mnemonic");
            }
        } catch (error) {
            console.error('Failed to fetch private key:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPhantom = async () => {
        // @ts-ignore
        select('Phantom');
        await connect();
        closeModal();
    };

    return (
        <Modal
            className='flex items-center justify-center'
            modalClassName='bg-main-background rounded-2xl max-w-md w-full p-4'
            open={open}
            closeModal={closeModal}
        >
            <h2 className='text-lg font-bold mb-4'>Connect Wallet</h2>
            <Button
                className='w-full mb-2'
                onClick={handleSelectBurner}
                disabled={loading}
            >
                {loading ? 'Connecting...' : 'Connect Burner Wallet'}
            </Button>
            <Button
                className='w-full'
                onClick={handleSelectPhantom}
            >
                Connect Phantom Wallet
            </Button>
        </Modal>
    );
}

import Tabs from '../ui/tabs';
import type { User } from '@lib/types/user';
import React, {useEffect, useRef, useState} from 'react';
import { useUser } from '@lib/context/user-context';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fetchAllDigitalAssetWithTokenByOwner, fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { publicKey } from '@metaplex-foundation/umi';
import { Button } from '@components/ui/button';
import { Modal } from '@components/modal/modal';
import { WrappedNFTViewerModal } from '@components/modal/WrappedNFTViewerModal';
import { fetchCandyMachine, fetchCandyGuard, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { useRouter } from 'next/router';
import {getToken} from '@lib/firebase/utils';
import {toast} from 'react-hot-toast';
import {getTokenBalance} from '@lib/solana';

const DEADCOIN_MINT_ADDRESS = 'r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh';

type UserDetailsProps = Pick<User, 'name' | 'wallet' | 'createdAt'>;

type Attribute = {
    trait_type: string;
    value: string;
};

type NFTMetadata = {
    name: string;
    image: string;
    description: string;
    attributes: Attribute[];
};

export function CollectDetails({ wallet }: UserDetailsProps): JSX.Element {
    const solanaEndpoint = process.env.NEXT_PUBLIC_QUICK_NODE_URL;

    const umi = createUmi(solanaEndpoint!)
        .use(mplCandyMachine())
        .use(mplTokenMetadata())
        .use(dasApi());

    const { user } = useUser();
    const router = useRouter();
    const { mintFrom } = router.query; // Get the mintFrom parameter from the URL

    // These are the DeadCaster NFT collections - stored in a secret
    const collections = JSON.parse(process.env.NEXT_PUBLIC_CANDY_MACHINE_IDS!).map((id: any) => ({
        candyMachineId: id
    }));


    const [balance, setBalance] = useState<number | null>(null);
    const [collectionData, setCollectionData] = useState<NFTMetadata[]>([]);
    const [selectedCollectionCandyMachineId, setSelectedCollectionCandyMachineId] = useState<string | null>(null);
    const [collectionName, setCollectionName] = useState<string>('');
    const [mintPrice, setMintPrice] = useState<string>(''); // State for the mint price
    const [mintPriceValue, setMintPriceValue] = useState<number>(0); // State for the mint price
    const [isMinting, setIsMinting] = useState<boolean>(false); // State to manage minting process
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false); // State for confirmation modal
    const [isViewerModalOpen, setIsViewerModalOpen] = useState<boolean>(false); // State for NFT viewer modal
    const [userNFTs, setUserNFTs] = useState<NFTMetadata[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const previousTxRef = useRef<string | undefined>(user?.lastWalletTransaction);
    const isInitialRender = useRef(true);
    const [fee, setFee] = useState<string>('')
    const [totalCost, setTotalCost] = useState<string>('')

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            // @ts-ignore
            previousTxRef.current = user?.lastWalletTransaction; // Initialize previousTx on the first render
            return;
        }

        if (user?.lastWalletTransaction !== previousTxRef.current) {
            setMessage("NFT mint success.")
            toast.success("The NFT mint was successful.")

            // @ts-ignore
            previousTxRef.current = user?.lastWalletTransaction;
        }
    }, [user?.lastWalletTransaction]);

    useEffect(() => {
        getTokenBalance(user?.wallet?.tokens[0].associatedAccount!, DEADCOIN_MINT_ADDRESS)
            .then(setBalance)
            .catch((error) => {
                console.error('Failed to fetch balance:', error);
            });
    }, []);

    const formatNumberWithCommas = (value: bigint | number): string => {
        // Divide by 10^9 to remove the 9 decimal places
        const wholeValue = BigInt(value) / BigInt(1_000_000_000);
        return wholeValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    useEffect(() => {
        const fetchUserNFTs = async () => {
            if (!user?.wallet?.publicKey) {
                console.error('User wallet public key is not available');
                return;
            }

            try {
                // Convert the string public key to a PublicKey object
                const userPublicKey = publicKey(user.wallet.publicKey);

                // Fetch all NFTs for the user
                const assets = await fetchAllDigitalAssetWithTokenByOwner(umi, userPublicKey);

                const data = await Promise.all(
                    assets.map(async (asset) => {
                        const response = await fetch(asset.metadata.uri);
                        return await response.json();
                    })
                );
                setUserNFTs(data);
            } catch (error) {
                console.error('Error fetching user NFTs:', error);
            }
        };

        fetchUserNFTs();
    }, []);

    useEffect(() => {
        const fetchCollectionData = async () => {
            try {
                const data = await Promise.all(
                    collections.map(async (collection: { candyMachineId: any; }) => {
                        const candyMachine = await fetchCandyMachine(
                            umi,
                            publicKey(collection.candyMachineId)
                        );

                        const collectionAssets = await fetchDigitalAsset(
                            umi,
                            publicKey(candyMachine.collectionMint)
                        );
                        const response = await fetch(collectionAssets.metadata.uri);
                        return await response.json();
                    })
                );
                console.log('collection {}', data);
                setCollectionData(data);
            } catch (error) {
                console.error('Error fetching collection data:', error);
            }
        };

        fetchCollectionData();
    }, []);

    useEffect(() => {
        if (mintFrom) {
            // If mintFrom is present in the URL, show a confirmation modal
            openMintConfirmationModal(mintFrom as string);
        }
    }, [mintFrom]);

    const openMintConfirmationModal = async (candyMachineId: string) => {
        setSelectedCollectionCandyMachineId(candyMachineId);

        // Fetch collection name and mint price for the confirmation modal
        const candyMachine = await fetchCandyMachine(umi, publicKey(candyMachineId));
        const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

        const collectionName = (await fetchDigitalAsset(umi, publicKey(candyMachine.collectionMint))).metadata.name;
        setCollectionName(collectionName);

        if (candyGuard.guards.tokenPayment) {
            // @ts-ignore
            const amountValue = candyGuard.guards.tokenPayment.value.amount;
            const mintPrice = Number(BigInt(amountValue) / BigInt(1_000_000_000)); // Convert to a number
            setMintPriceValue(mintPrice); // Use the number value
            setMintPrice(formatNumberWithCommas(amountValue)); // Keep original formatting for display

            const mintPriceNumber = mintPrice;

            console.log("Parsed Mint Price Number:", mintPriceNumber);

            const transactionFee = !isNaN(mintPriceNumber) ? mintPriceNumber * 0.03 : 0;
            console.log("Calculated Transaction Fee:", transactionFee);

            const totalCost = mintPriceNumber + transactionFee;
            console.log("Calculated Total Cost:", totalCost);

// Format numbers as strings with commas and two decimal places
            setFee(transactionFee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
            setTotalCost(totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
        }

        setIsConfirmationModalOpen(true);
    };

    const handleOpenViewerModal = (candyMachineId: string, collectionName: string) => {
        setSelectedCollectionCandyMachineId(candyMachineId);
        setCollectionName(collectionName);
        setIsViewerModalOpen(true);
    };

    const handleMint = async () => {
        if (!user || !selectedCollectionCandyMachineId) return;

        setIsMinting(true);

        try {
            // Post to the handle-mint API endpoint
            const token = await getToken();

            const response = await fetch('/api/handle-mint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    mintId: selectedCollectionCandyMachineId,
                    token: token,
                }),
            });

            if (!response.ok) {
                throw new Error('Minting failed.');
            }
            setMessage("Hold tight, we're minting your NFT.");

            // Handle successful minting, e.g., navigate or update the UI
            setIsConfirmationModalOpen(false);
            console.log('Minting successful');
        } catch (error) {
            console.error('Error during mint:', error);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <>
            {/* Confirmation Modal */}
            <Modal
                modalClassName="relative bg-main-background rounded-2xl max-w-xl w-full h-auto overflow-hidden"
                open={isConfirmationModalOpen}
                closeModal={() => setIsConfirmationModalOpen(false)}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Confirm Minting</h2>
                    <p>
                        You are about to mint from the collection <strong>{collectionName}</strong>.<br />
                        Mint Price: <strong>{mintPrice} DeadCoin</strong><br />
                        Transaction Fee: <strong>{fee} DeadCoin</strong><br/>
                        Total Cost: <strong>{totalCost} DeadCoin</strong>
                    </p>
                    {balance !== null && balance < mintPriceValue && (
                        <div>
                            <p className="text-red-500 mt-2">Insufficient DeadCoin balance to mint.</p>
                            <div className="mt-6 flex justify-end space-x-4">
                                <Button
                                    onClick={() => (window.location.href = '/wallet?tab=buy')}
                                    className="bg-blue-500 hover:bg-blue-700 text-white"
                                >
                                    Buy DeadCoin
                                </Button>
                            </div>
                        </div>
                    )}
                    {balance !== null && balance >= mintPriceValue && (
                    <div className="mt-6 flex justify-end space-x-4">
                        <Button onClick={() => setIsConfirmationModalOpen(false)} className="bg-gray-500 hover:bg-gray-700 text-white">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMint}
                            disabled={isMinting || (balance < mintPriceValue)}
                            className="bg-blue-500 hover:bg-blue-700 text-white"
                        >
                            {isMinting ? 'Minting...' : 'Confirm'}
                        </Button>
                    </div>
                    )}
                </div>
            </Modal>

            {/* NFT Viewer Modal */}
            <Modal
                modalClassName="relative bg-main-background rounded-2xl max-w-xl w-full h-[672px] overflow-hidden"
                open={isViewerModalOpen}
                closeModal={() => setIsViewerModalOpen(false)}
            >
                <WrappedNFTViewerModal
                    id={user ? user.id : ''}
                    name={user ? user.name : 'User Name Unknown'}
                    closeModal={() => setIsViewerModalOpen(false)}
                    candyMachineId={selectedCollectionCandyMachineId!}
                    collectionName={collectionName}
                />
            </Modal>

            <div>
                <div className="flex items-center mb-7">
                    {message}
                </div>
                <div className="mb-5">Find NFT collectibles and add them to your wallet.</div>
                <Tabs tabs={[`My Collectibles (${userNFTs.length})`, 'Find Collectibles']}>
                    <div key="my-collectibles" className="container space-y-16">
                        {userNFTs.length === 0 ? (
                            <div>No collectibles yet!</div>
                        ) : (
                            userNFTs.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row items-start space-y-8 sm:space-y-0 sm:space-x-8"
                                >
                                    <div className="w-full sm:w-1/2 rounded-3xl overflow-hidden shadow-xl shadow-indigo-700/30">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <h2 className="text-3xl font-semibold">{item.name}</h2>
                                        <p className="text-gray-500 mt-2">{item.description}</p>
                                        <div className="mt-4">
                                            <ul className="flex flex-wrap -m-1">
                                                {item.attributes?.length > 0 ? (
                                                    item.attributes.map((trait, index) => (
                                                        <li key={index} className="border px-2 py-0.5 rounded m-1">
                                                            <div className="text-xs text-gray-400 font-medium">
                                                                {trait.trait_type}
                                                            </div>
                                                            <div className="text-sm">{trait.value}</div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-gray-500">No attributes available</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="container space-y-16">
                        {collectionData.length === 0 ? (
                            <div>Loading...</div>
                        ) : (
                            collectionData.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row items-start space-y-8 sm:space-y-0 sm:space-x-8"
                                >
                                    <div className="w-full sm:w-1/2 rounded-3xl overflow-hidden shadow-xl shadow-indigo-700/30">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <h2 className="text-3xl font-semibold">{item.name}</h2>
                                        <p className="text-gray-500 mt-2">{item.description}</p>
                                        <div className="mt-4">
                                            <ul className="flex flex-wrap -m-1">
                                                {item.attributes.map((trait, index) => (
                                                    <li
                                                        key={index}
                                                        className="border px-2 py-0.5 rounded m-1"
                                                    >
                                                        <div className="text-xs text-gray-400 font-medium">
                                                            {trait.trait_type}
                                                        </div>
                                                        <div className="text-sm">{trait.value}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button
                                            className="accent-tab bg-main-accent text-lg font-bold text-white
                                                           outline-none transition hover:brightness-90
                                                           active:brightness-75 xs:static xs:translate-y-0
                                                           xs:hover:bg-main-accent/90 xs:active:bg-main-accent/75
                                                           xl:w-11/12 mt-4"
                                            onClick={() =>
                                                handleOpenViewerModal(collections[index].candyMachineId, item.name)
                                            }
                                        >
                                            View Collection
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Tabs>
            </div>
        </>
    );
}

import React, { useEffect, useState } from 'react';
import { MainHeader } from '@components/home/main-header';
import type { User } from '@lib/types/user';
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fetchCandyMachine, fetchCandyGuard, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';

export type NFTViewerProps = Pick<User, 'id' | 'name'> & {
    closeModal: () => void;
    candyMachineId: string;
    collectionName: string;
};

export type NFT = {
    name: string;
    description: string;
    image: string;
    minted: boolean;
};

function formatNumberWithCommas(value: bigint | number): string {
    // Divide by 10^9 to remove the 9 decimal places
    const wholeValue = BigInt(value) / BigInt(1_000_000_000);
    return wholeValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function WrappedNFTViewerModal({
                                          id,
                                          name,
                                          closeModal,
                                          candyMachineId,
                                          collectionName,
                                      }: NFTViewerProps): JSX.Element {
    const solanaEndpoint = process.env.NEXT_PUBLIC_QUICK_NODE_URL;
    const umi = createUmi(solanaEndpoint!).use(mplCandyMachine());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [itemsAvailable, setItemsAvailable] = useState<number>(0);
    const [itemsRedeemed, setItemsRedeemed] = useState<bigint>(BigInt(0));
    const [price, setPrice] = useState<string>('0');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const loadNFTs = async () => {
            setError(null);

            try {
                const candyMachinePublicKey = publicKey(candyMachineId);
                const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
                const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

                if (candyGuard.guards.tokenPayment) {
                    // @ts-ignore
                    const amountValue = candyGuard.guards.tokenPayment.value.amount;
                    setPrice(formatNumberWithCommas(amountValue));
                }
                // number of items in the candy machine
                setItemsAvailable(candyMachine.items.length);

                // number of items redeemed
                setItemsRedeemed(candyMachine.itemsRedeemed);

                // Get the NFT Metaplex data for each item in the candy machine
                const nftsData = await Promise.all(
                    candyMachine.items.map(async (item) => await fetchNFT(item.uri, item.minted))
                );

                setNfts(nftsData);
            } catch (err) {
                setError('Failed to load NFTs.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadNFTs();
    }, []);

    const fetchNFT = async (uri: string, minted: boolean): Promise<NFT> => {
        const response = await fetch(uri);
        const json = await response.json();
        return {
            name: json.name,
            description: json.description,
            image: json.image,
            minted: minted,
        };
    };

    const handleMint = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) return; // Prevent duplicate submissions

        setIsSubmitting(true);

        try {
            // Redirect to /collect page after "Mint" button is clicked
            window.location.href = `/collect?mintFrom=${candyMachineId}`;
        } catch (error) {
            console.error('Error during mint:', error);
            setError('Redirection failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // if they've all been minted then you can't mint anymore
    const isMintDisabled = itemsAvailable === Number(itemsRedeemed);

    return (
        <>
            <MainHeader
                useActionButton
                disableSticky
                iconName="XMarkIcon"
                tip="Close"
                className="absolute flex w-full items-center gap-6 rounded-tl-2xl"
                title=""
                action={closeModal}
            />
            <section className="p-6 mt-8 h-full overflow-y-auto">
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-2xl font-semibold">Collection: {collectionName}</h2>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <ul className="flex flex-wrap -m-1">
                        <li className="border px-2 py-0.5 rounded m-1">
                            <div className="text-xs text-gray-400 font-medium">Items Minted</div>
                            <div className="text-sm">
                                {itemsRedeemed.toString()}/{itemsAvailable}
                            </div>
                        </li>
                        <li className="border px-2 py-0.5 rounded m-1">
                            <div className="text-xs text-gray-400 font-medium">Price</div>
                            <div className="text-sm">{price} (DeadCoin)</div>
                        </li>
                    </ul>
                    <form onSubmit={handleMint}>
                        <button
                            type="submit"
                            disabled={isMintDisabled || isSubmitting}
                            className={`font-bold py-2 px-6 rounded ${
                                isMintDisabled || isSubmitting
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {isSubmitting ? 'Minting...' : 'Get One!'}
                        </button>
                    </form>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        nfts.map((nft, index) => (
                            <div key={index} className="border rounded-lg p-2">
                                <img src={nft.image}
                                     alt={nft.name}
                                     className={`w-full h-auto mb-4 rounded-lg ${nft.minted ? 'grayscale' : ''}`} />
                                <h3 className="text-lg font-semibold">{nft.name}</h3>
                                <p className="text-gray-500">{nft.description}</p>
                                <div className="mt-4">
                                    <ul className="flex flex-wrap -m-1">
                                        <li className="border px-2 py-0.5 rounded m-1">
                                            <div className="text-xs text-gray-400 font-medium">
                                                {nft.minted ? 'Already Minted' : 'Available'}
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </>
    );
}
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { mplCandyMachine } = require('@metaplex-foundation/mpl-candy-machine');
const { publicKey } = require('@metaplex-foundation/umi');
const {
    fetchCandyMachine,
    fetchCandyGuard,
} = require('@metaplex-foundation/mpl-candy-machine');

const umi = createUmi('https://fluent-warmhearted-hill.solana-devnet.quiknode.pro/2d58d7be6f446baff6834bc91618e7002d004e83/')
    .use(mplCandyMachine());

const printDetails = async () => {
    const candyMachinePublicKey = publicKey('AnY9wAvUqhAgJPARYYLEbAHm7tiTbq1qjHnudS3iJSPs');
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

    console.log("Candy Machine:", candyMachine);
    console.log("Candy Guard:", candyGuard);
}

printDetails();

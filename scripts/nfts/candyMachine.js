const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults')
const { mplCandyMachine, mintV2, safeFetchCandyGuard} = require('@metaplex-foundation/mpl-candy-machine')
const {  generateSigner, publicKey, transactionBuilder, keypairIdentity, some, signerIdentity, signerPayer,
    createSignerFromKeypair
} = require('@metaplex-foundation/umi');
const {
    fetchCandyMachine,
    fetchCandyGuard,
} = require('@metaplex-foundation/mpl-candy-machine')
const {mplTokenMetadata, findTokenRecordPda} = require('@metaplex-foundation/mpl-token-metadata')
const { setComputeUnitLimit, createMintWithAssociatedToken} = require('@metaplex-foundation/mpl-toolbox')
const {encode} = require('bs58');


//create a umi instance


const printDetails = async (candyMachineId) => {
    const candyMachinePublicKey = publicKey(candyMachineId);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

    console.log("Candy Machine:", candyMachine);
    console.log("Candy Guard:", candyGuard);
}

const mintFromPrivateKey = async () => {
    const umi = createUmi('https://fluent-warmhearted-hill.solana-devnet.quiknode.pro/2d58d7be6f446baff6834bc91618e7002d004e83/')
        .use(mplCandyMachine())
        .use(mplTokenMetadata());

//this is the user's private key we'll mint to this
    const walletPrivateKey = "[47,76,251,180,228,8,241,55,174,248,12,24,85,184,244,107,43,119,251,175,158,104,143,2,211,113,110,197,41,93,134,183,214,103,242,40,231,205,186,205,113,21,226,201,30,140,77,170,112,78,235,15,208,56,99,12,176,230,64,149,141,39,206,205]"

//this is the treasury private key we'll use this to pay for the transaction
    const treasuryPrivateKey = "[144,214,191,67,75,20,250,157,71,174,168,44,176,158,100,12,183,48,88,180,135,207,245,85,33,253,243,126,255,6,32,13,181,58,58,72,53,10,200,195,55,143,247,126,218,135,141,43,201,12,140,21,15,162,254,103,190,110,71,30,203,112,93,155]"

    const candyMachineId = 'GXEJjR4ijYVy82oqwv6caynhzB3p2ieyiauJbFJ3eycs'

    const candyMachinePublicKey = publicKey(candyMachineId);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    const candyGuard = await safeFetchCandyGuard(
        umi,
        candyMachine.mintAuthority,
    );

    //print the details before we mint
    //printDetails(candyMachineId)
    console.log('Minting...')

    // Convert the private keys from string to Uint8Array
    const userKeypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(JSON.parse(walletPrivateKey)))
    const treasuryKeypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(JSON.parse(treasuryPrivateKey)))

    //signers
    umi.use(signerIdentity(createSignerFromKeypair(umi, userKeypair), true));
    umi.use(signerPayer(createSignerFromKeypair(umi, treasuryKeypair)));

    // Mint from the Candy Machine.
    const nftMint = generateSigner(umi);
    const transaction = await transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
            mintV2(umi, {
                tokenStandard: candyMachine.tokenStandard,
                candyMachine: candyMachine.publicKey,
                candyGuard: candyGuard?.publicKey,
                nftMint,
                collectionMint: candyMachine.collectionMint,
                collectionUpdateAuthority: candyMachine.authority,
                payer: treasuryKeypair.publicKey,
                mintArgs: {
                    tokenPayment: some({
                        mint: candyGuard.guards.tokenPayment.value.mint,
                        destinationAta: candyGuard.guards.tokenPayment.value.destinationAta
                    }),
                },
            })
        );
    const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
    });
    const txid = encode(signature);
    console.log("Mint Success {}", txid)
}

mintFromPrivateKey(CANDY_MACHINE_ID).then(() => {
    console.log('minted')
}).catch((err) => {
    console.log("well that didn't work - {}", err)
});

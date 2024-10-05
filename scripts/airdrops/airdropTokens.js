const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const xlsx = require('xlsx');
const fs = require('fs');
const bs58 = require("bs58");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendToken(fromTokenAccount, senderWallet, toPublicKey, mintAddress, amount, connection) {

    try {
        console.log("Creating or getting associated token account for {}", toPublicKey)
        const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            senderWallet,
            new web3.PublicKey(mintAddress),
            new web3.PublicKey(toPublicKey),
            true,
            'finalized'
        );
        console.log("Created or got token account for {} account address {}", toPublicKey, toTokenAccount.address.toString())
        console.log("Sleeping for 3 seconds to let the network sync if the account was newly created, gross")
        await sleep(3000); // Sleep for 3 seconds, the quicknode RPC can be off a few seconds so let's wait...
        console.log("Awake, now transferring the tokens to the account {}", toTokenAccount.address.toString())
        await splToken.transfer(
            connection,
            senderWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            senderWallet.publicKey,
            amount,
            []
        );
        console.log(`Transfer of ${amount / Math.pow(10, 9)} tokens to ${toPublicKey} successful!`);
        return amount;  // Return the amount successfully transferred
    } catch (error) {
        console.error(`Failed to send ${amount / Math.pow(10, 9)} tokens to ${toPublicKey}:`, error);
        return 0;  // Return 0 if the transfer failed
    }
}

async function airdropTokens(privateKeyFilePath, tokenMintAddress, tokenAmount, filePath) {

    const privateKeyBase58 = fs.readFileSync(privateKeyFilePath, 'utf8').trim();
    const privateKeyBytes = bs58.decode(privateKeyBase58);

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    const uniqueAddresses = [...new Set(data.map(item => item['Solana Address']))];

    const connection = new web3.Connection("https://patient-crimson-isle.solana-mainnet.quiknode.pro/b7189bde4439da909ac75f99811289c684e78e0b/",
        'confirmed');
    const maxRetries = 3;
    let totalTokensSent = 0;  // Counter for the total tokens sent

    const senderWallet = web3.Keypair.fromSecretKey(privateKeyBytes);

    const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        senderWallet,
        new web3.PublicKey(tokenMintAddress),
        senderWallet.publicKey
    );

    console.log("Ok, let's airdrop some folks - sheet has {} addresses, sending {} deadcoin to each", uniqueAddresses.length, tokenAmount)
    for (const address of uniqueAddresses) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            let amountToSend = tokenAmount * Math.pow(10, 9);  // Adjust for token decimals
            try {
                console.log("Sending tokens to {} attempt #{}", address, attempt)
                let sentAmount = await sendToken(fromTokenAccount, senderWallet, address, tokenMintAddress, amountToSend, connection);
                if (sentAmount > 0) {
                    totalTokensSent += sentAmount;
                    console.log("Sent tokens to {} on attempt #{}", address, attempt)
                    break; // Break if success
                }
            } catch (error) {
                if (attempt === maxRetries) {
                    console.error(`Final failed attempt to send token to ${address}`);
                } else {
                    console.log(`Retrying to send token to ${address}, attempt ${attempt}`);
                }
            }
        }
    }
    console.log(`Finished total tokens sent: ${totalTokensSent / Math.pow(10, 9)} tokens`);
}

// Load wallet secret key securely
const privateKeyFilePath = '/Users/chris/.config/solana/community_private_key.txt'; // Path to the file containing the base58 encoded private key
const tokenMintAddress = 'r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh';
const tokenAmount = 10000;  // Number of tokens to send, adjusted for 9 decimals in the function
const excelFilePath = './smb-gen3.xlsx';

// Start the airdrop
airdropTokens(privateKeyFilePath, tokenMintAddress, tokenAmount, excelFilePath)
    .then(() => console.log('Airdrop completed successfully.'))
    .catch(err => console.error('Airdrop encountered an error:', err));

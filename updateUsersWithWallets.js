require('dotenv').config(); // Load environment variables from .env file
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const nacl = require('tweetnacl');
const crypto = require('crypto-js');
const bs58 = require('bs58');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { createAssociatedTokenAccountIdempotent } = require('@solana/spl-token');

// Firebase Admin SDK configuration
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path to your service account key JSON file

// Initialize Firebase Admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// Solana configuration
const quickNodeUrl = process.env.SOLANA_QUICKNODE_URL;
const secretKeyBase58 = process.env.SOLANA_SECRET_KEY;
const secretKey = bs58.decode(secretKeyBase58);

const connection = new Connection(quickNodeUrl, 'confirmed');
const keypair = Keypair.fromSecretKey(secretKey);

// Function to generate Solana key pair
const generateKeyPair = () => {
    const keyPair = nacl.sign.keyPair();
    const publicKey = bs58.encode(Buffer.from(keyPair.publicKey));
    const privateKey = bs58.encode(Buffer.from(keyPair.secretKey));
    return { publicKey, privateKey };
};

// Function to encrypt private key
const encryptPrivateKey = (privateKey, secret) => {
    return crypto.AES.encrypt(privateKey, secret).toString();
};

// Retrieve encryption secret from environment variable
const encryptionSecret = process.env.ENCRYPTION_SECRET;

if (!encryptionSecret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not defined');
}

const deadcoMint = new PublicKey('r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh');

// Function to create the associated token account with retry logic
const createAssociatedTokenAccountWithRetry = async (payer, mint, owner) => {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const associatedTokenAccount = await createAssociatedTokenAccountIdempotent(
                connection,
                payer,
                mint,
                owner
            );
            return associatedTokenAccount;
        } catch (error) {
            if (attempt === 2 || error.name !== 'TransactionExpiredBlockheightExceededError') {
                throw error;
            }
            // Retry logic with a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

// Update all users with Solana wallet key pairs and associated token accounts
const updateUsersWithWallets = async () => {
    try {
        console.log('Fetching users...');
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();

        console.log(`Found ${usersSnapshot.size} users. Updating...`);

        for (const doc of usersSnapshot.docs) {
            const userRef = db.collection('users').doc(doc.id);
            const { publicKey, privateKey } = generateKeyPair();
            const encryptedPrivateKey = encryptPrivateKey(privateKey, encryptionSecret);
            const owner = new PublicKey(publicKey);

            console.log(`Updating user ${doc.id} with publicKey ${publicKey}`);

            try {
                // Create the associated token account
                const associatedTokenAccount = await createAssociatedTokenAccountWithRetry(
                    keypair,
                    deadcoMint,
                    owner
                );

                batch.update(userRef, {
                    wallet: {
                        publicKey,
                        privateKey: encryptedPrivateKey,
                        balance: 0,
                        tokens: FieldValue.arrayUnion({
                            associatedAccount: associatedTokenAccount.toBase58(),
                            name: 'DeadCoin',
                            image: 'https://arweave.net/4JJ_OkspoUbBeArWjMUbD5NrfQdC2PcxDIED_PUT93Y',
                            symbol: 'DEADCO'
                        })
                    },
                });
            } catch (error) {
                console.error(`Error creating associated token account for user ${doc.id}:`, error);
            }
        }

        await batch.commit();
        console.log('All users updated with Solana wallet key pairs and associated token accounts.');
    } catch (error) {
        console.error('Error updating users:', error);
    }
};

updateUsersWithWallets();
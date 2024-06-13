require('dotenv').config(); // Load environment variables from .env file
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');
const bs58 = require('bs58');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { createAssociatedTokenAccountIdempotent } = require('@solana/spl-token');
const bip39 = require('bip39'); // For generating mnemonics
const { derivePath } = require('ed25519-hd-key'); // For deriving key pairs from mnemonics

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

const encryptionKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest('hex');


// Function to generate Solana key pair from a mnemonic
const generateKeyPairFromMnemonic = (mnemonic) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
// Derive the key pair using the path for Solana
    const derivationPath = "m/44'/501'/0'/0'"; // Standard derivation path for Solana
    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);

// Get the private and public keys
    const privateKey = Array.from(keypair.secretKey);
    const publicKey = keypair.publicKey.toBase58();
    return { publicKey, privateKey };
};

// Function to encrypt data
const encrypt = (text, key) => {
    console.log(`encrypting ${text} with key ${key}`);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

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
            if (attempt === 2) {
                throw error;
            }
            // Retry logic with a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

// Update all users with new Solana wallet key pairs and associated token accounts
const updateUsersWithWallets = async () => {
    try {
        console.log('Fetching users...');
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();

        console.log(`Found ${usersSnapshot.size} users. Updating...`);

        for (const doc of usersSnapshot.docs) {
            const userRef = db.collection('users').doc(doc.id);

            // Generate mnemonic and key pair
            const mnemonic = bip39.generateMnemonic();
            const { publicKey, privateKey } = generateKeyPairFromMnemonic(mnemonic);
            const encryptedPrivateKey = encrypt(JSON.stringify(privateKey), encryptionKey);
            const encryptedMnemonic = encrypt(mnemonic, encryptionKey);
            const owner = new PublicKey(publicKey);

            console.log(`Updating user ${doc.id} with publicKey ${publicKey}`);
            console.log(`Mnemonic: ${mnemonic}`);
            console.log(`Private Key: ${JSON.stringify(privateKey)}`);

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
                        mnemonic: encryptedMnemonic,
                        tokens: FieldValue.arrayUnion({
                            associatedAccount: associatedTokenAccount.toBase58(),
                            name: 'DeadCoin',
                            image: 'https://arweave.net/4JJ_OkspoUbBeArWjMUbD5NrfQdC2PcxDIED_PUT93Y',
                            symbol: 'DEADCO'
                        })
                    },
                    balance: FieldValue.delete()
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

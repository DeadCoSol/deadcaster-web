require('dotenv').config(); // Load environment variables from .env file
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const nacl = require('tweetnacl');
const crypto = require('crypto-js');
const bs58 = require('bs58');

// Firebase Admin SDK configuration
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path to your service account key JSON file

// Initialize Firebase Admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

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

// Function to decrypt private key (for reference)
const decryptPrivateKey = (encryptedPrivateKey, secret) => {
    const bytes = crypto.AES.decrypt(encryptedPrivateKey, secret);
    return bytes.toString(crypto.enc.Utf8);
};

// Retrieve encryption secret from environment variable
const encryptionSecret = process.env.ENCRYPTION_SECRET;

if (!encryptionSecret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not defined');
}

// Update all users with Solana wallet key pairs
const updateUsersWithWallets = async () => {
    try {
        console.log('Fetching users...');
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();

        console.log(`Found ${usersSnapshot.size} users. Updating...`);

        usersSnapshot.forEach((doc) => {
            const userRef = db.collection('users').doc(doc.id);
            const { publicKey, privateKey } = generateKeyPair();
            const encryptedPrivateKey = encryptPrivateKey(privateKey, encryptionSecret);

            console.log(`Updating user ${doc.id} with publicKey ${publicKey}`);

            batch.update(userRef, {
                wallet: {
                    publicKey,
                    privateKey: encryptedPrivateKey,
                    balance: 0,
                },
            });
        });

        await batch.commit();
        console.log('All users updated with Solana wallet key pairs.');
    } catch (error) {
        console.error('Error updating users:', error);
    }
};

updateUsersWithWallets();

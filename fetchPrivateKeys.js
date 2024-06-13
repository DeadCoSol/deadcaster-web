require('dotenv').config(); // Load environment variables from .env file
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const crypto = require('crypto');
const bs58 = require('bs58');

// Firebase Admin SDK configuration
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path to your service account key JSON file

// Initialize Firebase Admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const encryptionKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest('hex');

// Function to decrypt data
const decrypt = (text, key) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// Function to fetch all users and get their private keys and mnemonics
const fetchUsersPrivateKeys = async () => {
    try {
        console.log('Fetching users...');
        const usersSnapshot = await db.collection('users').get();

        console.log(`Found ${usersSnapshot.size} users.`);

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            if (userData.wallet && userData.wallet.privateKey && userData.wallet.mnemonic) {
                const encryptedPrivateKey = userData.wallet.privateKey;
                const encryptedMnemonic = userData.wallet.mnemonic;
                const decryptedPrivateKey = decrypt(encryptedPrivateKey, encryptionKey);
                const decryptedMnemonic = decrypt(encryptedMnemonic, encryptionKey);

                console.log(`User ${doc.id} - Public Key: ${userData.wallet.publicKey}`);
                console.log(`User ${doc.id} - Decrypted Private Key: ${decryptedPrivateKey}`);
                console.log(`User ${doc.id} - Decrypted Mnemonic: ${decryptedMnemonic}`);
            } else {
                console.log(`User ${doc.id} does not have a wallet, private key, or mnemonic.`);
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

fetchUsersPrivateKeys();

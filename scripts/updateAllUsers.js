require('dotenv').config(); // Load environment variables from .env file
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Firebase Admin SDK configuration
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path to your service account key JSON file

// Initialize Firebase Admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// Move all users' wallet mnemonic and secrets to the user_extensions collection
const updateAllUsers = async () => {
    try {
        console.log('Fetching users...');
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();

        console.log(`Found ${usersSnapshot.size} users and starting to copy mnemonic and secret...`);

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();

            // Check if the user has a wallet with mnemonic and privateKey
            if (userData.wallet && userData.wallet.mnemonic && userData.wallet.privateKey) {
                console.log(`Copying user ${doc.id}`);

                const userExtensionsRef = db.collection('user_extensions').doc(doc.id);

                try {
                    // Create the new document in the user_extensions collection
                    batch.set(userExtensionsRef, {
                        mnemonic: userData.wallet.mnemonic,
                        privateKey: userData.wallet.privateKey,
                        timestamp: FieldValue.serverTimestamp()
                    });

                    console.log(`Copied user mnemonic: ${userData.wallet.mnemonic} and private key: ${userData.wallet.privateKey} to user_extensions`);
                } catch (error) {
                    console.error(`Error copying mnemonic and secret for user ${doc.id}:`, error);
                }
            }
        }

        await batch.commit();
        console.log('All users mnemonics and secrets copied to the user_extensions collection.');
    } catch (error) {
        console.error('Error copying users:', error);
    }
};

updateAllUsers();

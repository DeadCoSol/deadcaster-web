import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import * as crypto from 'crypto';
import * as bs58 from 'bs58';
import {Connection, Keypair, PublicKey} from '@solana/web3.js';
import {createAssociatedTokenAccountIdempotent, getOrCreateAssociatedTokenAccount, transfer} from '@solana/spl-token';
import type {Tweet} from './types';
import {bookmarkConverter, tweetConverter, userConverter} from './types';
import {mnemonicToSeedSync, generateMnemonic} from 'bip39';
import {derivePath} from 'ed25519-hd-key';

const Bip39 = {mnemonicToSeedSync,generateMnemonic};

// Ensure Firebase is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const firestore = admin.firestore();

// Use QuickNode server and secret key stored in environment variables
const quickNodeUrl = functions.config().solana.quicknode_url;
const secretKeyBase58 = functions.config().solana.secret_key;
const secretKey = bs58.decode(secretKeyBase58);//deadco community wallet secret key

const connection = new Connection(quickNodeUrl, 'confirmed');
const keypair = Keypair.fromSecretKey(secretKey);

//DeadCo
const tokenMintAddress = 'r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh';


// Get encryption secret from environment variables
const encryptionKey = crypto.createHash('sha256').update(functions.config().encryption.secret).digest('hex');


// Function to create the associated token account with retry logic
// @ts-ignore
const createAssociatedTokenAccountWithRetry = async (payer, mint, owner) => {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await createAssociatedTokenAccountIdempotent(
                connection,
                payer,
                mint,
                owner
            );
        } catch (error) {
            // @ts-ignore
            if (attempt === 2) {
                throw error;
            }
            // Retry logic with a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};


const generateKeyPairFromMnemonic = (mnemonic: string) => {
    const seed = Bip39.mnemonicToSeedSync(mnemonic);
// Derive the key pair using the path for Solana
    const derivationPath = "m/44'/501'/0'/0'"; // Standard derivation path for Solana
    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);

// Get the private and public keys
    const privateKey = Array.from(keypair.secretKey);
    const publicKey = keypair.publicKey.toBase58();
    return { publicKey, privateKey };
};

function trimAddress (address: string): string {
    if (!address) return '';
    const start = address.slice(0, 4);
    const end = address.slice(-4);
    return `${start}...${end}`;
};

const encrypt = (text: string, key: string) => {
    console.log(`encrypting ${trimAddress(text)} with key ${trimAddress(key)}`);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Cloud Function to add wallet on user creation
export const addWalletOnUserCreate = functions.runWith({
    timeoutSeconds: 540,
    failurePolicy: true,
}).firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userId = context.params.userId;
        const userRef = firestore.collection('users').doc(userId);
        const userExtensionsRef = firestore.collection('user_extensions').doc(userId);

        // Generate mnemonic and key pair
        const mnemonic = Bip39.generateMnemonic();
        const { publicKey, privateKey } = generateKeyPairFromMnemonic(mnemonic);
        const encryptedPrivateKey = encrypt(JSON.stringify(privateKey), encryptionKey);
        const encryptedMnemonic = encrypt(mnemonic, encryptionKey);

        // Deadco pays for the creation of the account
        const deadcoMint = new PublicKey('r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh');
        const payer = keypair;
        const owner = new PublicKey(publicKey); // The new wallet we created for the user

        try {
            //best effort to ensure we aren't double creating
            const userSnap = await userRef.get();
            const userData = userSnap.data();

            //in the case where more than one event gets emitted
            if (userData && userData.wallet && userData.wallet.tokens) {
                console.log(`This user (${userId}) already has a wallet in the onCreate, they shouldn't... returning`);
                return;
            }

            // Create the associated token account with retry logic
            const associatedTokenAccount = await createAssociatedTokenAccountWithRetry(
                payer,
                deadcoMint,
                owner
            );

            // Solana wallet, Deadco details and associated token account information stored on the user
            await userRef.update({
                wallet: {
                    publicKey,
                    tokens: admin.firestore.FieldValue.arrayUnion({
                        associatedAccount: associatedTokenAccount?.toBase58(),
                        name: 'DeadCoin',
                        image: 'https://arweave.net/4JJ_OkspoUbBeArWjMUbD5NrfQdC2PcxDIED_PUT93Y',
                        symbol: 'DEADCO'
                    })
                },
            });
            logger.info(`Wallet and associated account added for user ${userId}`);

            // Store the encrypted mnemonic and privateKey in user_extensions collection
            await userExtensionsRef.set({
                mnemonic: encryptedMnemonic,
                privateKey: encryptedPrivateKey,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            logger.info(`User extensions added for user ${userId}`);
        } catch (error) {
            logger.error('Error adding wallet:', error);
            throw new Error(`Error adding wallet for user ${userId}: ${error}`);
        }
    });

// Cloud Function to process transaction on transaction creation
export const processTransactionOnCreate = functions.runWith({
    timeoutSeconds: 540,
    failurePolicy: true,
}).firestore
    .document('users/{userId}/transactions/{transactionId}')
    .onCreate(async (snap, context) => {
        const userId = context.params.userId;
        const transactionId = context.params.transactionId;
        const transactionData = snap.data();
        const userRef = firestore.collection('users').doc(userId);
        const transactionRef = userRef.collection('transactions').doc(transactionId);

        const { deadCoAmount, amount, paymentId } = transactionData;

        try {
            const userDoc = await userRef.get();
            const userData = userDoc.data();

            if (!userData || !userData.wallet || !userData.wallet.publicKey) {
                throw new Error('User wallet not found');
            }

            const owner = new PublicKey(userData.wallet.publicKey);

            // Send DeadCo
            let amountToSend = deadCoAmount * Math.pow(10, 9);  // Adjust for token decimals (9)
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                keypair,
                new PublicKey(tokenMintAddress),
                keypair.publicKey
            );

            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                keypair,
                new PublicKey(tokenMintAddress),
                owner
            );

            const solanaTx = await transfer(
                connection,
                keypair,
                fromTokenAccount.address,
                toTokenAccount.address,
                keypair.publicKey,
                amountToSend,
                []
            );

            console.log(`Sending DEADCO to ${userData.name} with id (${userData.id}) for payment id (${paymentId}) 
            sending ${deadCoAmount} to address ${owner.toString()} for the ${amount} processed`);

            // Update transaction status
            await transactionRef.update({
                status: 'COMPLETE',
                received: deadCoAmount,
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            logger.info(`Transaction ${transactionId} processed for user ${userId}`);

            //ping the user wallet to refresh
            await userRef.update({
                lastWalletTransaction: solanaTx.toString()
            })
        } catch (error) {
            logger.error('Error processing transaction:', error);
            // @ts-ignore
            const message = error.message;
            await transactionRef.update({
                status: 'ERROR',
                errorMessage: message
            });

            throw new Error(`Error processing transaction for user ${userId}: ${error}`);

        }
    });

/**
 * This cleans up the stats object when a tweet is deleted.
 */
export const normalizeStats = functions.firestore
    .document("tweets/{tweetId}")
    .onDelete(async (snapshot): Promise<void> => {
        const tweetId = snapshot.id;
        const tweetData = snapshot.data() as Tweet;

        logger.info(`Normalizing stats from tweet ${tweetId}`);

        const { userRetweets, userLikes } = tweetData;

        const usersStatsToDelete = new Set([...userRetweets, ...userLikes]);

        const batch = firestore.batch();

        usersStatsToDelete.forEach((userId) => {
            logger.info(`Deleting stats from ${userId}`);

            const userStatsRef = firestore
                .doc(`users/${userId}/stats/stats`);

            batch.update(userStatsRef, {
                tweets: admin.firestore.FieldValue.arrayRemove(tweetId),
                likes: admin.firestore.FieldValue.arrayRemove(tweetId),
            });
        });

        const bookmarksQuery = firestore
            .collectionGroup("bookmarks")
            .where("id", "==", tweetId)
            .withConverter(bookmarkConverter);

        const docsSnap = await bookmarksQuery.get();

        logger.info(`Deleting ${docsSnap.size} bookmarks`);

        // @ts-ignore
        docsSnap.docs.forEach(({ id, ref }) => {
            logger.info(`Deleting bookmark ${id}`);
            batch.delete(ref);
        });

        const commentQuery = firestore
            .collection("tweets")
            .where("parent.id", "==", tweetId)
            .withConverter(tweetConverter);

        const commentsSnap = await commentQuery.get();

        // @ts-ignore
        commentsSnap.docs.forEach((doc) => {
            logger.info(`Deleting comment ${doc.id}`);
            batch.delete(doc.ref);
        });

        await batch.commit();

        logger.info(`Normalizing stats for fade ${tweetId} is done`);
    });

export const sendNotifications = functions.firestore
    .document("tweets/{tweetId}")
    .onCreate(async (snapshot): Promise<void> => {
        const tweetId = snapshot.id;
        const tweetData = snapshot.data() as Tweet;

        logger.info(`Sending notifications from tweet ${tweetId}`);
        const userId = tweetData.createdBy;

        const tweetingUser = await fetchUserById(userId);
        const followers = tweetingUser?.followers;

        // Send a Fade notification if its parent is null
        if (followers && followers.length && tweetData.parent === null) {
            // @ts-ignore
            followers.forEach(followerId => {
                createNotification(followerId, tweetId, 'FADE');
            });
        } else if (tweetData.parent !== null) {
            const parentTweetDocRef = firestore
                .collection('tweets')
                .doc(tweetData.parent.id)
                .withConverter(tweetConverter);
            const parentTweetSnap = await parentTweetDocRef.get();
            const parentTweet = parentTweetSnap.data();
            const createdBy = parentTweet?.createdBy;
            if (createdBy != null) {
                createNotification(createdBy, tweetId, 'COMMENT');
            }
        }
    });

async function createNotification(sendToUserId: string, tweetId: string, activityType: string) {
    const userDocRef = firestore.collection('users').doc(sendToUserId);
    const notificationRef = userDocRef.collection('notifications');

    const notification = {
        tweetId: tweetId,  // Fade that caused the notification
        type: activityType,  // Type of activity, e.g., 'fade'
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        // @ts-ignore
        await firestore.runTransaction(async (transaction) => {
            // Create the notification in the subcollection
            transaction.set(notificationRef.doc(), notification);

            // Update the main document field
            transaction.update(userDocRef, {
                notifications: true
            });
        });
        console.log(`Notification created and user ${sendToUserId} updated`);
    } catch (error) {
        console.error(`Error creating notification or updating user ${sendToUserId}:`, error);
        throw new Error(`Error creating notification or updating user for user ${sendToUserId}: ${error}`);
    }
}

async function fetchUserById(userId: string) {
    try {
        const userRef = firestore
            .collection("users")
            .doc(userId)
            .withConverter(userConverter);

        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            console.log("No such user!");
            return null;
        }
        return userSnap.data();  // Return the user data as a User class instance or the specified format
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

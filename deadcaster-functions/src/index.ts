import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import * as nacl from 'tweetnacl';
import * as crypto from 'crypto-js';
import * as bs58 from 'bs58';

import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { createAssociatedTokenAccountIdempotent } from "@solana/spl-token";

import { bookmarkConverter, tweetConverter, userConverter } from './types';
import type { Tweet } from "./types";

// Ensure Firebase is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const firestore = admin.firestore();

// Use QuickNode server and secret key stored in environment variables
const quickNodeUrl = functions.config().solana.quicknode_url;
const secretKeyBase58 = functions.config().solana.secret_key;
const secretKey = bs58.decode(secretKeyBase58);

const connection = new Connection(quickNodeUrl, 'finalized');
const keypair = Keypair.fromSecretKey(secretKey);

// Generate Solana key pair
const generateKeyPair = () => {
    const keyPair = nacl.sign.keyPair();
    const publicKey = bs58.encode(Buffer.from(keyPair.publicKey));
    const privateKey = bs58.encode(Buffer.from(keyPair.secretKey));
    return { publicKey, privateKey };
};

// Encrypt private key
const encryptPrivateKey = (privateKey: string, secret: string) => {
    return crypto.AES.encrypt(privateKey, secret).toString();
};

// Get encryption secret from environment variables
const encryptionSecret = functions.config().encryption.secret;

// Function to create the associated token account with retry logic
// @ts-ignore
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
            // @ts-ignore
            if (attempt === 2 || error.name !== 'TransactionExpiredBlockheightExceededError') {
                throw error;
            }
            // Retry logic with a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

// Cloud Function to add wallet on user creation
export const addWalletOnUserCreate = functions.runWith({
    timeoutSeconds: 540,
}).firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userId = context.params.userId;
        const userRef = firestore.collection('users').doc(userId);

        // Generate a Solana wallet for our user
        const { publicKey, privateKey } = generateKeyPair();

        // Encrypt their private key for storing
        const encryptedPrivateKey = encryptPrivateKey(privateKey, encryptionSecret);

        // Deadco pays for the creation of the account
        const deadcoMint = new PublicKey('r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh');
        const payer = keypair;
        const owner = new PublicKey(publicKey); // The new wallet we created for the user

        try {
            // Create the associated token account with retry logic
            const associatedTokenAccount = await createAssociatedTokenAccountWithRetry(
                payer,
                deadcoMint,
                owner
            );

            // Solana wallet, Deadco Metaplex details and associated token account information stored on the user
            await userRef.update({
                wallet: {
                    publicKey,
                    privateKey: encryptedPrivateKey,
                    balance: 0,
                    tokens: admin.firestore.FieldValue.arrayUnion({
                        associatedAccount: associatedTokenAccount?.toBase58(),
                        name: 'DeadCoin',
                        image: 'https://arweave.net/4JJ_OkspoUbBeArWjMUbD5NrfQdC2PcxDIED_PUT93Y',
                        symbol: 'DEADCO'
                    })
                },
            });

            logger.info(`Wallet and associated account added for user ${userId}`);
        } catch (error) {
            logger.error('Error adding wallet:', error);
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

        docsSnap.docs.forEach(({ id, ref }) => {
            logger.info(`Deleting bookmark ${id}`);
            batch.delete(ref);
        });

        const commentQuery = firestore
            .collection("tweets")
            .where("parent.id", "==", tweetId)
            .withConverter(tweetConverter);

        const commentsSnap = await commentQuery.get();

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
        const user = userSnap.data();
        return user;  // Return the user data as a User class instance or the specified format
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

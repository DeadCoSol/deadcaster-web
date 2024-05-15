/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import {onRequest} from "firebase-functions/v2/https";
import functions = require('firebase-functions');
import * as logger from "firebase-functions/logger";

import {bookmarkConverter, tweetConverter, userConverter} from './types';
import type {Tweet} from "./types";
import * as admin from 'firebase-admin';

// Ensure Firebase is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const firestore = admin.firestore();

/**
 * Example for http endpoints, I'm going to use this for the Coinbase Commerce call back.
 */
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

/**
 * This cleans up the stats object when a tweet is deleted.
 */
exports.normalizeStats = functions.firestore
    .document("tweets/{tweetId}")
    .onDelete(async (snapshot): Promise<void> => {
      const tweetId = snapshot.id;
      const tweetData = snapshot.data() as Tweet;

      logger.info(`Normalizing stats from tweet ${tweetId}`);

      const {userRetweets, userLikes} = tweetData;

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

      docsSnap.docs.forEach(({id, ref}) => {
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
      })

      await batch.commit();

      logger.info(`Normalizing stats for fade ${tweetId} is done`);
});

exports.sendNotifications = functions.firestore
    .document("tweets/{tweetId}")
    .onCreate(async (snapshot): Promise<void> => {
        const tweetId = snapshot.id;
        const tweetData = snapshot.data() as Tweet;

        logger.info(`Sending notifications from tweet ${tweetId}`);
        const userId = tweetData.createdBy;

        const tweetingUser = await fetchUserById(userId);
        const followers = tweetingUser?.followers;

        //Send a Fade notification if it's parent is null
        if (followers && followers.length && tweetData.parent === null) {
            followers.forEach(followerId => {
                createNotification(followerId, tweetId, 'FADE');
            });
        } else if(tweetData.parent !== null){
            const parentTweetDocRef = firestore
                .collection('tweets')
                .doc(tweetData.parent.id)
                .withConverter(tweetConverter);
            const parentTweetSnap = await parentTweetDocRef.get();
            const parentTweet = parentTweetSnap.data();
            const createdBy = parentTweet?.createdBy
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



import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

export type Notifications = {
    type: string;
    tweetId: string;
    actorId: string;
    createdAt: Timestamp | null;
    read: boolean;
    additionalInfo?: {
        [key: string]: any;  // Flexible object for additions coming like NFTs and Claims
    };
};

export const notificationsConverter: FirestoreDataConverter<Notifications> = {
    toFirestore(notification) {
        return { ...notification };
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);

        return { ...data } as Notifications;
    }
};
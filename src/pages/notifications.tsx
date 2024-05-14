import {useMemo, useEffect} from 'react';
import { AnimatePresence } from 'framer-motion';
import {orderBy, query } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { useCollection } from '@lib/hooks/useCollection';
import { useArrayDocument } from '@lib/hooks/useArrayDocument';
import {
    tweetsCollection,
    userNotificationsCollection
} from '@lib/firebase/collections';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { TweetNotification } from '@components/tweet/tweet-notification';
import { Loading } from '@components/ui/loading';
import type { ReactElement, ReactNode } from 'react';
import {StatsEmpty} from '@components/tweet/stats-empty';
import {updateNotifications} from '@lib/firebase/utils';

const handleNotifications = async (userId: string): Promise<void> => {
    await updateNotifications(userId).then(() => {
        console.log(`toggled notifications off for user ${ userId }`);
    });
}

export default function Notifications(): JSX.Element {
    const { user } = useAuth();
    const userId = user?.id as string;

    useEffect(() => {
        if(user?.notifications){
            handleNotifications(userId);
        }
        return;
    }, []);

    const { data: notificationsRef, loading: notificationsRefLoading } = useCollection(
        query(userNotificationsCollection(userId), orderBy('createdAt', 'desc')),
        { allowNull: true }
    );

    const tweetIds = useMemo(
        () => notificationsRef?.map(({ tweetId }) => tweetId) ?? [],
        [notificationsRef]
    );

    const { data: tweetData, loading: tweetLoading } = useArrayDocument(
        tweetIds,
        tweetsCollection,
        { includeUser: true }
    );

    return (
        <MainContainer>
            <SEO title='Notifications / DeadCaster' />

            <MainHeader className='flex items-center justify-between'>
                <div className='-mb-1 flex flex-col'>
                    <h2 className='-mt-1 text-xl font-bold'>Notifications</h2>
                    <p className='text-xs text-light-secondary dark:text-dark-secondary'>
                        @{user?.username}
                    </p>
                </div>
            </MainHeader>
            <section className='mt-0.5'>
                {notificationsRefLoading || tweetLoading ? (
                    <Loading className='mt-5' />
                ) : !notificationsRef ? (
                    <StatsEmpty
                        title='No notifications'
                        description='Follow DeadCasters to get notifications about their Fades here.'
                        imageData={{ src: '/assets/deadcaster-white.svg', alt: 'No bookmarks' }}
                    />
                ) : (
                    <AnimatePresence mode='popLayout'>
                        {tweetData?.map((tweet) => (
                            <TweetNotification {...tweet} key={tweet.id} />
                        ))}
                    </AnimatePresence>
                )}
            </section>
        </MainContainer>
    );
}

Notifications.getLayout = (page: ReactElement): ReactNode => (
    <ProtectedLayout>
        <MainLayout>
            <HomeLayout>{page}</HomeLayout>
        </MainLayout>
    </ProtectedLayout>
);


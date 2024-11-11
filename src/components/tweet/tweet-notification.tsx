import Link from 'next/link';
import { motion } from 'framer-motion';
import cn from 'clsx';
import { delayScroll } from '@lib/utils';
import { ImagePreview } from '@components/input/image-preview';
import { UserAvatar } from '@components/user/user-avatar';
import { UserName } from '@components/user/user-name';
import type { Variants } from 'framer-motion';
import type { Tweet } from '@lib/types/tweet';
import type { User } from '@lib/types/user';

export type TweetNotificationProps = Tweet & {
    user: User;
    parentTweet?: boolean;
    notificationType?: string; // Add a notification type to identify tipping
};

export const variants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

export function TweetNotification(tweetNotification: TweetNotificationProps): JSX.Element {
    const {
        id: tweetId,
        text,
        images,
        parent,
        parentTweet,
        user: tweetUserData,
        notificationType
    } = tweetNotification;

    const { name, username, verified, photoURL } = tweetUserData;

    const tweetLink = `/fade/${tweetId}`;
    const reply = !!parent;

    const isTipNotification = notificationType?.startsWith("TIP_");

    return (
        <motion.article
            animate={{
                ...variants.animate,
                ...(parentTweet && { transition: { duration: 0.2 } })
            }}
        >
            <Link
                href={tweetLink}
                scroll={!reply}
                className={cn(
                    `accent-tab hover-card relative flex flex-col 
                    gap-y-4 px-4 py-3 outline-none duration-200`,
                    parentTweet
                        ? 'mt-0.5 pt-2.5 pb-0'
                        : 'border-b border-light-border dark:border-dark-border'
                )}
                draggable={false}
                onClick={delayScroll(200)}
            >
                <div className='grid grid-cols-[.1fr,.9fr] gap-x-3 gap-y-1'>
                    <div className='flex flex-col items-start gap-2'>
                        <UserAvatar src={photoURL} alt={name} username={username} />
                        <UserName
                            name={
                                isTipNotification
                                    ? `${name} was tipped by you!`
                                    : !reply
                                        ? `${name} recently faded.`
                                        : `${name} recently commented.`
                            }
                            username={username}
                            verified={verified}
                            className='text-light-primary dark:text-dark-primary'
                        />
                        <div className='flex justify-between gap-2'>
                            {isTipNotification && (
                                <p>You tipped ${name} for this tweet!</p>
                            )}
                        </div>
                        {text && (
                            <p className='whitespace-pre-line break-words'>{text}</p>
                        )}
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}

import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@lib/context/auth-context';
import { useUser } from '@lib/context/user-context';
import { SEO } from '@components/common/seo';
import { UserHomeCover } from '@components/user/user-home-cover';
import { UserHomeAvatar } from '@components/user/user-home-avatar';
import { Loading } from '@components/ui/loading';
import { variants } from '@components/user/user-header';
import type { LayoutProps } from './common-layout';
import {WalletDetails} from '@components/wallet/wallet-details';
import {CollectDetails} from '@components/collect/collect-details';

export function CollectHomeLayout({ children }: LayoutProps): JSX.Element {
    const { user, isAdmin } = useAuth();
    const { user: userData, loading } = useUser();

    const {
        query: { id }
    } = useRouter();

    const coverData = { src: '/collect.jpeg', alt: 'The band' };

    const profileData = userData
        ? { src: '/wallet.png', alt: 'Wallet Icon' }
        : null;

    const { id: userId } = user ?? {};

    const isOwner = userData?.id === userId;

    return (
        <>
            {userData && (
                <SEO
                    title={`${`${userData.name} (@${userData.username})`} / DeadCaster Collectibles`}
                />
            )}
            <motion.section {...variants} exit={undefined}>
                {loading ? (
                    <Loading className='mt-5' />
                ) : !userData || !isOwner ? (
                    <>
                        <UserHomeCover key={"CollectHomeCover"} />
                        <div className='flex flex-col gap-8'>
                            <div className='relative flex flex-col gap-3 px-4 py-3'>
                                <UserHomeAvatar key={"CollectHomeAvatar"}/>
                                <p className='text-xl font-bold'>@{id}</p>
                            </div>
                            <div className='p-8 text-center'>
                                <p className='text-3xl font-bold'>This account doesn’t exist</p>
                                <p className='text-light-secondary dark:text-dark-secondary'>
                                    Try searching for another.
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <UserHomeCover coverData={coverData} key={"WalletHomeCoverLower"} />
                        <div className='relative flex flex-col gap-3 px-4 py-3'>
                            <div className='flex justify-between'>
                                <UserHomeAvatar profileData={profileData} key={"CollectHomeAvatarLower"}/>
                            </div>
                            <CollectDetails {...userData} key={"CollectDetails"}/>
                        </div>
                    </>
                )}
            </motion.section>
        </>
    );
}

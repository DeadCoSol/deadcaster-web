
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { useCollection } from '@lib/hooks/useCollection';
import {
    tweetsCollection
} from '@lib/firebase/collections';
import { HomeLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { MainHeader } from '@components/home/main-header';
import { MainContainer } from '@components/home/main-container';
import { Button } from '@components/ui/button';
import { ToolTip } from '@components/ui/tooltip';
import { HeroIcon } from '@components/ui/hero-icon';
import type { ReactElement, ReactNode } from 'react';


export default function Wallets(): JSX.Element {
    const { user } = useAuth();

    const { open, openModal, closeModal } = useModal();

    const userId = user?.id as string;

    return (
        <MainContainer>
            <SEO title='Wallets / DeadCaster' />
            <MainHeader className='flex items-center justify-between'>
                <div className='-mb-1 flex flex-col'>
                    <h2 className='-mt-1 text-xl font-bold'>Wallets</h2>
                    <p className='text-xs text-light-secondary dark:text-dark-secondary'>
                        @{user?.username}
                    </p>
                </div>
                <Button
                    className='dark-bg-tab group relative p-2 hover:bg-light-primary/10
                     active:bg-light-primary/20 dark:hover:bg-dark-primary/10
                     dark:active:bg-dark-primary/20'
                    onClick={openModal}
                >
                    <HeroIcon className='h-5 w-5' iconName='ArchiveBoxXMarkIcon' />
                    <ToolTip
                        className='!-translate-x-20 translate-y-3 md:-translate-x-1/2'
                        tip='Clear wallets'
                    />
                </Button>
            </MainHeader>
            <section className='mt-0.5'>
                Add Burner Wallet details here...
            </section>
        </MainContainer>
    );
}

Wallets.getLayout = (page: ReactElement): ReactNode => (
    <ProtectedLayout>
        <MainLayout>
            <HomeLayout>{page}</HomeLayout>
        </MainLayout>
    </ProtectedLayout>
);

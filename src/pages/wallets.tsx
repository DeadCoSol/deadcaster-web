import {ProtectedLayout, UserLayout, WalletLayout} from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import type { ReactElement, ReactNode } from 'react';
import {WalletHomeLayout} from '@components/layout/wallet-home-layout';
import {DeadcoWallet} from '@components/wallet/deadco-wallet';
import {useUser} from '@lib/context/user-context';
import {StatsEmpty} from '@components/tweet/stats-empty';
import {AnimatePresence} from 'framer-motion';
import {WalletDataLayout} from '@components/layout/wallet-data-layout';


export default function Index(): JSX.Element {
    const { user } = useUser();

    return (
        <section>
        {!user ? (
            <StatsEmpty
                title={`No user`}
                description='Sorry we do not know who you are.'
            />
        ) : (
            <></>
        )}
        </section>
    );
}

Index.getLayout = (page: ReactElement): ReactNode => (
    <ProtectedLayout>
        <MainLayout>
            <WalletLayout>
                <WalletDataLayout>
                    <WalletHomeLayout>{page}</WalletHomeLayout>
                </WalletDataLayout>
            </WalletLayout>
        </MainLayout>
    </ProtectedLayout>
);

import {ProtectedLayout, UserLayout, WalletLayout} from '@components/layout/common-layout';
import {MainLayout} from '@components/layout/main-layout';
import type {ReactElement, ReactNode} from 'react';
import {WalletHomeLayout} from '@components/layout/wallet-home-layout';
import {useUser} from '@lib/context/user-context';
import {StatsEmpty} from '@components/tweet/stats-empty';
import {WalletDataLayout} from '@components/layout/wallet-data-layout';
import StripeProvider from '@components/stripe/StripeProvider';

export default function Wallet(): JSX.Element {
    const {user} = useUser();

    return (
        <section>
            {!user ? (
                <StatsEmpty
                    title={`No user`}
                    description="Sorry we do not know who you are."
                />
            ) : (
                <></>
            )}
        </section>
    );
}

Wallet.getLayout = (page: ReactElement): ReactNode => (
    <ProtectedLayout>
        <MainLayout>
            <StripeProvider>
                <WalletLayout>
                    <WalletDataLayout>
                        <WalletHomeLayout>
                            {page}
                        </WalletHomeLayout>
                    </WalletDataLayout>
                </WalletLayout>
            </StripeProvider>
        </MainLayout>
    </ProtectedLayout>
);

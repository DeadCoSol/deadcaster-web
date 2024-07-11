import {CollectLayout, ProtectedLayout, WalletLayout} from '@components/layout/common-layout';
import {MainLayout} from '@components/layout/main-layout';
import type {ReactElement, ReactNode} from 'react';
import {useUser} from '@lib/context/user-context';
import {StatsEmpty} from '@components/tweet/stats-empty';
import StripeProvider from '@components/stripe/StripeProvider';
import {CollectHomeLayout} from '@components/layout/collect-home-layout';
import {CollectDataLayout} from '@components/layout/collect-data-layout';

export default function Collect(): JSX.Element {
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

Collect.getLayout = (page: ReactElement): ReactNode => (
    <ProtectedLayout>
        <MainLayout>
            <StripeProvider>
                <CollectLayout>
                    <CollectDataLayout>
                        <CollectHomeLayout>
                            {page}
                        </CollectHomeLayout>
                    </CollectDataLayout>
                </CollectLayout>
            </StripeProvider>
        </MainLayout>
    </ProtectedLayout>
);

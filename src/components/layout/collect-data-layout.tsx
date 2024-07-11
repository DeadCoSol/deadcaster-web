import { useRouter } from 'next/router';
import {UserContextProvider, useUser} from '@lib/context/user-context';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import type { LayoutProps } from './common-layout';
import {useAuth} from '@lib/context/auth-context';
import {CollectHeader} from '@components/collect/collect-header';

export function CollectDataLayout({ children }: LayoutProps): JSX.Element {
    const {
        back
    } = useRouter();

    const { user, isAdmin } = useAuth();
    const loading = false;

    return (
        <UserContextProvider value={{ user, loading }} key={"CollectDataContext"}>
            {!user && !loading && <SEO title='User not found / DeadCaster' />}
            <MainContainer key={"CollectDataContextMain"}>
                <MainHeader useActionButton action={back} key={"CollectContextHeader"}>
                    <CollectHeader key={"CollectContextCollectHeader"}/>
                </MainHeader>
                {children}
            </MainContainer>
        </UserContextProvider>
    );
}

import { useRouter } from 'next/router';
import {UserContextProvider, useUser} from '@lib/context/user-context';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import type { LayoutProps } from './common-layout';
import {WalletHeader} from '@components/wallet/wallet-header';
import {useAuth} from '@lib/context/auth-context';

export function WalletDataLayout({ children }: LayoutProps): JSX.Element {
    const {
        back
    } = useRouter();

    const { user, isAdmin } = useAuth();
    const loading = false;

  return (
      <UserContextProvider value={{ user, loading }} key={"WalletContext"}>
        {!user && !loading && <SEO title='User not found / DeadCaster' />}
        <MainContainer key={"WalletContextMain"}>
          <MainHeader useActionButton action={back} key={"WalletContextHeader"}>
            <WalletHeader key={"WalletContextWalletHeader"}/>
          </MainHeader>
          {children}
        </MainContainer>
      </UserContextProvider>
  );
}

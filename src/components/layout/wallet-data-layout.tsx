import { useRouter } from 'next/router';
import { query, where, limit } from 'firebase/firestore';
import {UserContextProvider, useUser} from '@lib/context/user-context';
import { useCollection } from '@lib/hooks/useCollection';
import { usersCollection } from '@lib/firebase/collections';
import { SEO } from '@components/common/seo';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import type { LayoutProps } from './common-layout';
import {UserHeader} from '@components/user/user-header';
import {WalletHeader} from '@components/wallet/wallet-header';
import {useAuth} from '@lib/context/auth-context';

export function WalletDataLayout({ children }: LayoutProps): JSX.Element {
    const {
        back
    } = useRouter();

    const { user, isAdmin } = useAuth();
    const loading = false;

  return (
      <UserContextProvider value={{ user, loading }}>
        {!user && !loading && <SEO title='User not found / DeadCaster' />}
        <MainContainer>
          <MainHeader useActionButton action={back}>
            <WalletHeader />
          </MainHeader>
          {children}
        </MainContainer>
      </UserContextProvider>
  );
}

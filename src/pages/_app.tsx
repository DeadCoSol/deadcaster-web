import '@styles/globals.scss';

import { AuthContextProvider } from '@lib/context/auth-context';
import { ThemeContextProvider } from '@lib/context/theme-context';
import { AppHead } from '@components/common/app-head';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { DynamicContextProvider, DynamicWagmiConnector, } from "@lib/dynamic";
import { Providers } from "@components/layout/provider";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps
}: AppPropsWithLayout): ReactNode {
  const getLayout = Component.getLayout ?? ((page): ReactNode => page);

  return (
    <>
      <AppHead />
        <DynamicContextProvider
            settings={{
                environmentId: "e6ee1a00-32da-48de-9289-d3018220270a",
                walletConnectors: [SolanaWalletConnectors],
            }}
        >
            <Providers>
                <DynamicWagmiConnector>
                      <AuthContextProvider>
                        <ThemeContextProvider>
                          {getLayout(<Component {...pageProps} />)}
                        </ThemeContextProvider>
                      </AuthContextProvider>
                </DynamicWagmiConnector>
            </Providers>
        </DynamicContextProvider>
    </>
  );
}

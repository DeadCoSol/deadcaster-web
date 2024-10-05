import '@styles/globals.scss';

import { AuthContextProvider } from '@lib/context/auth-context';
import { ThemeContextProvider } from '@lib/context/theme-context';
import { AppHead } from '@components/common/app-head';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';


require('@solana/wallet-adapter-react-ui/styles.css'); // Default styles that can be overridden by your app

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

    // Use the single QuickNode URL from the environment variable
    const endpoint = process.env.NEXT_PUBLIC_QUICK_NODE_URL;

    const wallets = useMemo(() => [], []);

    return (
        <>
            <AppHead />

            <ConnectionProvider endpoint={endpoint!}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <AuthContextProvider>
                            <ThemeContextProvider>
                                {getLayout(<Component {...pageProps} />)}
                            </ThemeContextProvider>
                        </AuthContextProvider>
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </>
    );
}

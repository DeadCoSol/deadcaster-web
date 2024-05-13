// app/layout.tsx
import { DynamicContextProvider, DynamicWagmiConnector, } from "../../lib/dynamic";
import { Providers } from "./provider";

export default function RootLayout({ children, }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <DynamicContextProvider
            settings={{
                environmentId: "e6ee1a00-32da-48de-9289-d3018220270a",
            }}
        >
            <Providers>
                <DynamicWagmiConnector>
                    <body>{children}</body>
                </DynamicWagmiConnector>
            </Providers>
        </DynamicContextProvider>
        </html>
    );
}

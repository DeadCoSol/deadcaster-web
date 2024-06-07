import type { User } from '@lib/types/user';


export type WalletProps = {
    user: User
}

export function DeadcoWallet(wallet: WalletProps): JSX.Element {

    return (
        <section>
            Put the wallet component here...
        </section>
    )
}
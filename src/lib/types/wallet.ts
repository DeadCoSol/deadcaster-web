import {Token} from '@lib/types/token';
import {NFT} from '@lib/types/nft';

export type Wallet = {
    publicKey: string,
    balance: number,
    tokens: Token[],
    nfts: NFT[]
}
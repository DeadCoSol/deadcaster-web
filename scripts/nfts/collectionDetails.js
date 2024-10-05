const { publicKey } =
    require('@metaplex-foundation/umi')
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults')
const { mplTokenMetadata, fetchDigitalAsset} = require('@metaplex-foundation/mpl-token-metadata')


const collectionMint = 'DSgq7yThbcFDh7Kwt6dks1qdY9Pd6GyCb5CMVkBxapSQ'

const umi = createUmi('https://fluent-warmhearted-hill.solana-devnet.quiknode.pro/2d58d7be6f446baff6834bc91618e7002d004e83/')
    .use(mplTokenMetadata())

const showDetails = async () => {
    const collection = await fetchDigitalAsset(umi, publicKey(collectionMint))
    const response = await fetch(collection.metadata.uri)
    const collectionData = await response.json()
    console.log("Collection Data {}", collectionData)
}

showDetails()
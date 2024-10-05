![deadcaster.png](public%2Fdeadcaster.png)
<br />

<h1>
  DeadCaster - Web3 for Grateful Dead fans.
</h1>

## Vocabulary
- DeadCaster - The decentralized Social Media app for Grateful Dead fans.
- Fades - Twitter has tweets, Facebook has posts, DeadCaster has Fades (not fade away...)

## Features ✨
- Sufficiently Decentralized, your data is OWNED by your wallet.
- All Social Media Primitives are saved on Solana.
- Streaming the Grateful Dead Archive from our [Audius](https://audius.org) DeadCaster account.
- Minting cNFTs with [Metaplex](https://www.metaplex.com/) and the Candy Machine.  Dead art is the best!
- Our memecoin "DeadCoin" ($deadco) unlocks special features for holders of the coin in their wallet.

## Tech 🛠
- [Solana](https://solana.com/)
- [Firebase](https://firebase.google.com)
- [DeadCoin](https://twitter.com/DeadCoSol)
- [Audius](https://audius.org/)
- [Metaplex](https://www.metaplex.com/)
- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- Web3.js


## Development 💻

Here are the steps to run the project locally.

1. Clone the repository

   ```bash
   git clone https://github.com/DeadCoSol/deadcaster-web.git
   ```

1. Install dependencies

   ```bash
   npm i
   ```

1. Create a Firebase project and select the web app

1. Add your Firebase config to `.env.development`. Note that `NEXT_PUBLIC_MEASUREMENT_ID` is optional

1. Make sure you have enabled the following Firebase services:

   - Authentication. Enable the Google sign-in method.
   - Cloud Firestore. Create a database and set its location to your nearest region. 
   - Cloud Storage. Create a storage bucket.

1. Install Firebase CLI globally

   ```bash
   npm i -g firebase-tools
   ```

1. Log in to Firebase

   ```bash
   firebase login
   ```

1. Get your project ID

   ```bash
   firebase projects:list
   ```

1. Select your project ID

   ```bash
   firebase use your-project-id
   ```

1. At this point, you have two choices. Either run this project using the Firebase on the cloud or locally using emulator.

   1. Using the Firebase Cloud Backend:

      1. Deploy Firestore rules, Firestore indexes, and Cloud Storage rules

         ```bash
         firebase deploy --except functions
         ```

      1. Run the project

         ```bash
         npm run dev
         ```

   1. Using Firebase Local Emulator:

      1. Install [Java JDK version 11 or higher](https://jdk.java.net/) before proceeding. This is required to run the emulators.

      1. Set the environment variable `NEXT_PUBLIC_USE_EMULATOR` to `true` in `.env.development`. This will make the app use the emulators instead of the cloud backend.

      1. At this point, you can run the following command to have a fully functional DeadCaster running locally:

         ```bash
         npm run dev:emulators
         ```

> **_Note_**: When you deploy Firestore indexes rules, it might take a few minutes to complete. So before the indexes are enabled, you will get an error when you fetch the data from Firestore.<br><br>You can check the status of your Firestore indexes with the link below, replace `your-project-id` with your project ID: https://console.firebase.google.com/u/0/project/your-project-id/firestore/indexes

We need to set up app hosting and generate the following secrets in GCP secret manager and grant access to app hosting

-b live for prod -b deadcasterdev for test/dev

firebase apphosting:secrets:grantaccess NEXT_PUBLIC_URL -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_USE_EMULATOR -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_API_KEY -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_AUTH_DOMAIN -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_PROJECT_ID -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_STORAGE_BUCKET -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_MESSAGING_SENDER_ID -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_APP_ID -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_MEASUREMENT_ID -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_QUICK_NODE_URL -b live
firebase apphosting:secrets:grantaccess ENCRYPTION_SECRET -b live
firebase apphosting:secrets:grantaccess FIREBASE_SERVICE_ACCOUNT_KEY -b live
firebase apphosting:secrets:grantaccess FIREBASE_DATABASE_URL -b live
firebase apphosting:secrets:grantaccess STRIPE_SECRET_KEY -b live
firebase apphosting:secrets:grantaccess NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY -b live
firebase apphosting:secrets:grantaccess FIREBASE_AUTH_DOMAIN -b live

firebase functions:config:get
{
"encryption": {
"secret": "4d6f6e6b..."
},
"mint": {
"address": "r8EXVDnCDeiw1xxbUSU7MNbLfbG1tmWTvigjvWNCiqh"
},
"solana": {
"quicknode_url": "https://patient-crimson-isle.solana-mainnet.quiknode.pro/b7189bde4439da909ac75f99811289c684e78e0b/",
"secret_key": "h9Ue9..."
}
}

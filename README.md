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

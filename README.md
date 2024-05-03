![deadcaster.png](public%2Fdeadcaster.png)
<br />

<h1>
  DeadCaster - Web3 for Grateful Dead fans.
</h1>

## Vocabulary
- DeadCaster - The decentralized Social Media app for Grateful Dead fans.
- Fades - Twitter has tweets, Facebook has posts, DeadCaster has Fades (not fade away...)

## Features ✨
- Authentication with Dynamic.xyz and your Solana wallet of choice
- Streaming music from [Audius](https://audius.org)
- Minting cNFTs with [Metaplex](https://www.metaplex.com/)
- Strongly typed React components with TypeScript
- Users can add fades, like, refade, and reply
- Users can delete fades, add a fades to bookmarks, and pin their tweet
- Users can add images and GIFs to fade
- Users can follow and unfollow other users
- Users can see their and other followers and the following list
- Users can see all users and the trending list
- Realtime update likes, refades, and user profile
- User can edit their profile
- Responsive design for mobile, tablet, and desktop
- Users can customize the site color scheme and color background

## Tech 🛠
- [Solana](https://solana.com/)
- [DeadCoin](https://twitter.com/DeadCoSol)
- [Dynamic](https://www.dynamic.xyz/)
- [Audius](https://audius.org/)
- [Metaplex](https://www.metaplex.com/)
- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase](https://firebase.google.com)
- [SWR](https://swr.vercel.app)
- [Headless UI](https://headlessui.com)
- [React Hot Toast](https://react-hot-toast.com)
- [Framer Motion](https://framer.com)

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

   - Authentication. Enable the Google sign-in method. (This will be swapped soon for dynamic.xyz for Solana Wallets)
   - Cloud Firestore. Create a database and set its location to your nearest region. (This will be a cache while we commt to the Solana blockchain)
   - Cloud Storage. Create a storage bucket. (We will hold images here temporarily until we upload to metaplex)

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

      1. At this point, you can run the following command to have a fully functional Twitter clone running locally:

         ```bash
         npm run dev:emulators
         ```

> **_Note_**: When you deploy Firestore indexes rules, it might take a few minutes to complete. So before the indexes are enabled, you will get an error when you fetch the data from Firestore.<br><br>You can check the status of your Firestore indexes with the link below, replace `your-project-id` with your project ID: https://console.firebase.google.com/u/0/project/your-project-id/firestore/indexes

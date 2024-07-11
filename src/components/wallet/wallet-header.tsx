import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@lib/context/user-context';
import { UserName } from '../user/user-name';
import type { Variants } from 'framer-motion';

export const variants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export function WalletHeader(): JSX.Element {
  const { user, loading } = useUser();

  return (
    <AnimatePresence mode='popLayout' key={"WalletContextAnimate"}>
      {loading ? (
        <motion.div
          className='-mb-1 inner:animate-pulse inner:rounded-lg 
                     inner:bg-light-secondary dark:inner:bg-dark-secondary'
          {...variants}
          key='loadingWallet'
        >
          <div className='mb-1 -mt-1 h-5 w-24' />
          <div className='h-4 w-12' />
        </motion.div>
      ) : !user ? (
        <motion.h2 className='text-xl font-bold' {...variants} key='not-found-wallet'>
          My Wallet
        </motion.h2>
      ) : (
        <motion.div className='-mb-1 truncate' {...variants} key='foundWallet'>
          <UserName
            tag='h2'
            name={'My Wallet'}
            className='-mt-1 text-xl'
            iconClassName='w-6 h-6'
            verified={user.verified}
            key={"wallet-username"}
          />
          <p className='text-xs text-light-secondary dark:text-dark-secondary'>
            DeadCoin Smart Wallet
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

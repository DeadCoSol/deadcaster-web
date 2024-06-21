import { motion } from 'framer-motion';
import { variants } from './aside-trends';
import {UserAvatar} from '@components/user/user-avatar';
import React from 'react';

export function WalletDetails(): JSX.Element {

    return (
        <section className='hover-animation rounded-2xl bg-main-sidebar-background'>
            <motion.div className='inner:px-4 inner:py-3' {...variants}>
                <h2 className='text-xl font-bold'>
                    <UserAvatar src='logo192.jpeg' alt='DeadCoin' />
                    Your wallet
                </h2>
                <div>
                    This is your Crypto Wallet details for your DeadCaster account which allows you to:
                    <ul style={{ listStyleType: 'disc' }} className='ml-3 mt-2'>
                        <li>View your DeadCoin balance</li>
                        <li>View NFTs you have claimed</li>
                        <li>View your DeadCaster transactions</li>
                        <li>View details to import into another wallet</li>
                    </ul>
                    <br/>
                    <p className="mb-3 text-light-secondary dark:text-dark-secondary">
                        The keys for your wallet are in the "Wallet Details" tab on this page.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}

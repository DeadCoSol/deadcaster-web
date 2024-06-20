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
                    We've created a DeadCoin account for your DeadCaster account which allows you to:
                    <p className='ml-3 mt-2'>
                        <ul style={{ listStyleType: 'disc' }}>
                            <li>Transfer DeadCoin to this account</li>
                            <li>Interact with DeadCaster</li>
                            <li>Import this wallet into another wallet</li>
                        </ul>
                    </p>
                    <br/>
                    <p className="mb-3  text-light-secondary dark:text-dark-secondary">
                        The keys for your wallet are in the "Wallet Details" tab on this page.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}

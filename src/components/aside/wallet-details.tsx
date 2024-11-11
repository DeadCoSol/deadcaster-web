import { motion } from 'framer-motion';
import { variants } from './aside-trends';
import {UserAvatar} from '@components/user/user-avatar';
import React from 'react';
import {Button} from '@components/ui/button';

export function WalletDetails(): JSX.Element {

    return (
        <section className='hover-animation rounded-2xl bg-main-sidebar-background'>
            <motion.div className='inner:px-4 inner:py-3' {...variants}>
                <h2 className='text-xl font-bold'>
                    <UserAvatar src='logo192.jpeg' alt='DeadCoin' />
                    Your wallet
                </h2>
                <div>
                    <Button
                        className='accent-tab absolute right-4 -translate-y-[72px] bg-main-accent text-lg font-bold text-white
                       outline-none transition hover:brightness-90 active:brightness-75 xs:static xs:translate-y-0
                       xs:hover:bg-main-accent/90 xs:active:bg-main-accent/75 xl:w-11/12'
                    >
                        Connect to Phantom
                    </Button>

                </div>
            </motion.div>
        </section>
    );
}

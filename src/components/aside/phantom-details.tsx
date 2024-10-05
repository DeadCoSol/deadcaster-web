import Link from 'next/link';
import { motion } from 'framer-motion';
import { variants } from './aside-trends';
import {UserAvatar} from '@components/user/user-avatar';
import React from 'react';
import {FaExternalLinkAlt} from 'react-icons/fa';

export function PhantomDetails(): JSX.Element {

    return (
        <section className='hover-animation rounded-2xl bg-main-sidebar-background'>
            <motion.div className='inner:px-4 inner:py-3' {...variants}>
                <h2 className='text-xl font-bold'>
                        <UserAvatar src='phantom.jpeg' alt='Phantom' />
                        <Link href='https://phantom.app/' target='_blank' className='flex'>
                            Get Phantom Wallet &nbsp; <FaExternalLinkAlt className='mt-0.5'/>
                        </Link>
                </h2>
                <div className='mb-3'>
                    Phantom is an easy to use Wallet and has a lot of documentation to help you navigate the complex
                    world of Crypto Currency. You'll NEED to use Phantom to connect to your DeadCoin wallet to buy
                    collectibles and tip content creators.
                </div>
            </motion.div>
        </section>
    );
}

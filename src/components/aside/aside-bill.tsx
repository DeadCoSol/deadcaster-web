import { motion } from "framer-motion";
import { variants } from "@components/aside/aside-trends";
import {UserAvatar} from '@components/user/user-avatar';
import React from 'react';
import Image from 'next/image';


export function Bill(): JSX.Element {

    return (
        <section className='hover-animation rounded-2xl bg-main-sidebar-background'>
            <motion.div className='inner:px-4 inner:py-3' {...variants}>
                <h2 className='text-xl font-bold'>
                    In memory of Bill Walton
                </h2>
                <div className='mb-0'>
                    <Image src='bill.jpg'
                           width={500}
                           height={500}
                           alt="Bill Walton, the biggest DeadHead ever." layout="responsive">
                    </Image>
                </div>
                <div className='mb-3 text-light-secondary dark:text-dark-secondary'>
                    11/5/1952 - 05/27/2024
                </div>
            </motion.div>
        </section>
    );
}
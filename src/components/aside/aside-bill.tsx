import { motion } from "framer-motion";
import { variants } from "@components/aside/aside-trends";
import {UserAvatar} from '@components/user/user-avatar';
import React from 'react';
import Image from 'next/image';


export function Bill(): JSX.Element {

    return (
        <section className='hover-animation rounded-2xl bg-main-sidebar-background'>
            <motion.div className='inner:px-4 inner:py-3' {...variants}>
                <div className="flex justify-between items-center p-2">
                    <div className="flex items-center w-1/5">
                        <img src="/steallie.png" alt="stream" className="w-14 h-14 rounded-full" />
                    </div>
                    <div className="flex gap-10 w-4/5 justify-left"> {/* Adjusted gap to 4 for more spacing */}
                        <span className="text-xl font-bold">In memory of Bill Walton</span>
                    </div>
                </div>
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
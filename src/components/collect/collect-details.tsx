import Tabs from '../ui/tabs';
import type { User } from '@lib/types/user';
import React, {useEffect, useRef, useState} from 'react';
import {useUser} from '@lib/context/user-context';
import {useWindow} from '@lib/context/window-context';

type UserDetailsProps = Pick<User, 'name' | 'wallet' | 'createdAt'>;

export function CollectDetails({ wallet, createdAt }: UserDetailsProps): JSX.Element {
    const windowCtx =useWindow();
    const { user } = useUser();

    return (
        <>
            <div>
                <div className="mb-5">
                    Find NFT collectibles and add them to your wallet.
                </div>
                <Tabs tabs={['My Collectibles', 'Find Images', 'Find Bootlegs']}>
                    <div>
                        Nothing in your wallet yet!
                    </div>
                    <div>
                        Find NFTs
                    </div>
                    <div>
                        Coming Soon!
                    </div>
                </Tabs>
            </div>
        </>
    );
}

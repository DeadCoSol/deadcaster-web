import { useRef, useState } from 'react';
import cn from 'clsx';
import { MainHeader } from '@components/home/main-header';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { NextImage } from '@components/ui/next-image';
import { ToolTip } from '@components/ui/tooltip';
import type { ReactNode, ChangeEvent } from 'react';
import type { User } from '@lib/types/user';

type BuyDeadcoinModalProps = Pick<
    User,
    'id'
> & {
  closeModal: () => void;
};

export function BuyDeadCoinModal({
                                   id,
                                   closeModal,
                                 }: BuyDeadcoinModalProps): JSX.Element {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleBuyNowClick = () => {
    if (selectedOption) {
      alert('Buying coming soon!');
    }
  };

  return (
      <>
        <MainHeader
            useActionButton
            disableSticky
            iconName='XMarkIcon'
            tip='Close'
            className='absolute flex w-full items-center gap-6 rounded-tl-2xl'
            title='Buy DeadCoin on CoinBase'
            action={closeModal}
        >
        </MainHeader>
        <section className='p-6'>
          <NextImage
              src='logo512.jpeg'
              alt='DeadCoin'
              width={500}
              height={300}
              className='mb-4 mx-auto max-w-full'
          />
          <p className='mb-4'>Select an option to buy DeadCoin:</p>
          <select
              className='w-full mb-4 p-2 border rounded text-black font-bold'
              value={selectedOption}
              onChange={handleOptionChange}
          >
            <option value='' disabled>Select an option</option>
            <option value='10000-5'>10,000 DeadCoin for $5</option>
            <option value='20000-10'>20,000 DeadCoin for $10</option>
            <option value='40000-20'>40,000 DeadCoin for $20</option>
          </select>
          <Button
              className='bg-light-primary py-1 px-4 font-bold text-white focus-visible:bg-light-primary/90
                       enabled:hover:bg-light-primary/90 enabled:active:bg-light-primary/80 disabled:brightness-75
                       dark:bg-light-border dark:text-light-primary dark:focus-visible:bg-light-border/90
                       dark:enabled:hover:bg-light-border/90 dark:enabled:active:bg-light-border/75'
              onClick={handleBuyNowClick}
              disabled={!selectedOption}
          >
            Buy Now
          </Button>
        </section>
      </>
  );
}

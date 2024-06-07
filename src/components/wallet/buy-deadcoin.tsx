import cn from 'clsx';
import { useUser } from '@lib/context/user-context';
import { useModal } from '@lib/hooks/useModal';
import { Modal } from '@components/modal/modal';
import { Button } from '@components/ui/button';
import {BuyDeadCoinModal} from '@components/modal/buy-deadcoin-modal';


type BuyProps = {
  hide?: boolean;
};

export function BuyDeadCoin({ hide }: BuyProps): JSX.Element {
  const { user } = useUser();
  const { open, openModal, closeModal } = useModal();


  return (
    <form className={cn(hide && 'hidden md:block')}>
      <Modal
        modalClassName='relative bg-main-background rounded-2xl max-w-xl w-full h-[672px] overflow-hidden'
        open={open}
        closeModal={closeModal}
      >
        <BuyDeadCoinModal
          id={user? user.id : ''}
          closeModal={closeModal}/>
      </Modal>
      <Button
        className='dark-bg-tab self-start border border-light-line-reply px-4 py-1.5 font-bold
                   hover:bg-light-primary/10 active:bg-light-primary/20 dark:border-light-secondary
                   dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20'
        onClick={openModal}
      >
        Buy DeadCoin
      </Button>
    </form>
  );
}

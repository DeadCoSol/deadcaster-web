import { NextImage } from '@components/ui/next-image';
import type { ImageData } from '@lib/types/file';

type WalletHomeCoverProps = {
  coverData?: ImageData | null;
};

export function WalletHomeCover({ coverData }: WalletHomeCoverProps): JSX.Element {

  return (
    <div className='mt-0.5 h-36 xs:h-48 sm:h-52'>
      {coverData ? (
          <NextImage
            useSkeleton
            layout='fill'
            imgClassName='object-cover'
            src={coverData.src}
            alt={coverData.alt}
            key={coverData.src}
          />
      ) : (
        <div className='h-full bg-light-line-reply dark:bg-dark-line-reply' />
      )}
    </div>
  );
}

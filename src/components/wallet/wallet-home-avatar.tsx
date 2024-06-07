import { NextImage } from '@components/ui/next-image';
import type { ImageData } from '@lib/types/file';

type WalletHomeAvatarProps = {
  profileData?: ImageData | null;
};

export function WalletHomeAvatar({
  profileData
}: WalletHomeAvatarProps): JSX.Element {

  return (
    <div className='mb-8 xs:mb-14 sm:mb-16'>
        {profileData ? (
          <NextImage
            useSkeleton
            className='hover-animation relative h-full w-full bg-main-background
                       inner:!m-1 inner:rounded-full inner:transition inner:duration-200'
            imgClassName='rounded-full'
            src={profileData.src}
            alt={profileData.alt}
            layout='fill'
            key={profileData.src}
          />
        ) : (
          <div className='h-full rounded-full bg-main-background p-1'>
            <div className='h-full rounded-full bg-main-sidebar-background' />
          </div>
        )}
    </div>
  );
}

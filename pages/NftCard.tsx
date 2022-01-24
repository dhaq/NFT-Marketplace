import { FC, useState, useEffect } from "react";
import { EyeOffIcon } from "@heroicons/react/outline";
type Props = {
    details: any;
    onSelect: (id: string) => void;
    onTokenDetailsFetched?: (props: any) => unknown;
  };
  
  export const NftCard: FC<Props> = ({
    details,
    onSelect,
    onTokenDetailsFetched = () => {},
  }) => {
    const { name } = details ?? {};
    return (
<div className={`card bordered max-w-xs compact rounded-md`}>
          <figure className="min-h-16 animation-pulse-color">
            {true ? (
            //   <img
            //     src={image}
            //     onError={onImageError}
            //     className="bg-gray-800 object-cover"
            //   />
            <div className="w-auto h-48 flex items-center justify-center bg-gray-900 bg-opacity-40">
                <EyeOffIcon className="h-16 w-16 text-white-500" />
              </div>
            ) : (
              // Fallback when preview isn't available
              // This could be broken image, video, or audio
              <div className="w-auto h-48 flex items-center justify-center bg-gray-900 bg-opacity-40">
                <EyeOffIcon className="h-16 w-16 text-white-500" />
              </div>
            )}
          </figure>
          <div className="card-body">
            <h2 className="card-title text-sm text-left">{name}</h2>
          </div>
        </div>
      );
  }
  
export default NftCard
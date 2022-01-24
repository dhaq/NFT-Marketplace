import { FC, useState, useEffect } from "react";
import { EyeOffIcon } from "@heroicons/react/outline";
import useSWR from "swr";
import { Home } from './index'

type Props = {
    details: any;
    onSelect: (id: string) => void;
    onClickBuy: (nft: any) => void;
    onTokenDetailsFetched?: (props: any) => unknown;
  };
  
  export const NftCard: FC<Props> = ({
    details,
    onSelect,
    onClickBuy,
    onTokenDetailsFetched = () => {},
  }) => {
    const [fallbackImage, setFallbackImage] = useState(false);

    const onImageError = () => setFallbackImage(true);

    return (
<div className={`card bordered max-w-xs compact rounded-md`}>
          <figure className="min-h-16 animation-pulse-color">
            {!fallbackImage ? (
              <img
                src={details.image}
                onError={onImageError}
                className="bg-gray-800 object-cover"
              />
            ) : (
              // Fallback when preview isn't available
              // This could be broken image, video, or audio
              <div className="w-auto h-48 flex items-center justify-center bg-gray-900 bg-opacity-40">
                <EyeOffIcon className="h-16 w-16 text-white-500" />
              </div>
            )}
          </figure>
          <div className="card-body">
            <h2 className="card-title text-sm text-left">{details.description}</h2><br></br>
            <p className="text-2xl mb-4 font-bold text-white">{details.price} ETH</p>
          </div>
          <div className="card-footer">
          <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => {onClickBuy(details)}}>Buy</button>
          </div>
        </div>
      );
  }
  
export default NftCard
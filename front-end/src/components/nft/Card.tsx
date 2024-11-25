import { useEffect, useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { basicNftAbi } from '@/constants';
import { formatEther } from 'viem';
import Image from 'next/image';
import { formatAddress, isOwner } from '@/tools/ulits';
import UpdateModal from './UpdateModal';
import { Skeleton } from 'tdesign-react';
import BuyModal from './BuyModal';
import { type NftAttribute } from '@/interface/nft';

const Card = ({ item }: { item: NftAttribute }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenDesc, setTokenDesc] = useState<string>('');
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
  const { isConnected, address: currentAddress } = useAccount();

  const { data: nftUri, isPending: isGetTokenUriPending } = useReadContract({
    address: item.nftAddress,
    abi: basicNftAbi,
    functionName: 'tokenURI',
    args: [item.tokenId],
  });

  useEffect(() => {
    if (!isGetTokenUriPending && isConnected) {
      getTokenUri();
    }
  }, [isGetTokenUriPending, isConnected]);

  const getTokenUri = async () => {
    if (nftUri) {
      const requestUrl = (nftUri as string).replace('ipfs://', 'https://ipfs.io/ipfs/');
      const tokenURIResponse = await fetch(requestUrl);
      const tokenURIJson = await tokenURIResponse.json();
      setImageUrl(tokenURIJson.image);
      setTokenName(tokenURIJson.name);
      setTokenDesc(tokenURIJson.description);
    }
  };

  const handleNftClick = () => {
    if (isOwner(item.seller, currentAddress)) {
      console.log('You are the owner');
      setUpdateModalOpen(true);
    } else {
      console.log('You are not the owner');
      setBuyModalOpen(true);
    }
  };

  return (
    <>
      <UpdateModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        tokenId={item.tokenId}
        nftAddress={item.nftAddress}
      />
      <BuyModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        item={item}
        tokenName={tokenName}
      />
      <div
        className="flex flex-col justify-center border-2 p-2 cursor-pointer rounded-lg group hover:border-blue-500"
        onClick={handleNftClick}
      >
        <div className="italic text-sm text-gray-500 text-right opacity-0 group-hover:opacity-100">
          Owner is: {formatAddress(item.seller, currentAddress)}
        </div>
        <Skeleton loading={!imageUrl} style={{ width: '200px', height: '200px' }}>
          {imageUrl ? (
            <Image
              className="group-hover:scale-105 transition-all duration-300"
              src={imageUrl}
              alt={tokenName}
              width={200}
              height={200}
              loader={() => imageUrl}
            />
          ) : (
            <></>
          )}
        </Skeleton>
        <div className="flex flex-col pt-2">
          <div className="font-bold">
            {tokenName} #{item.tokenId}
          </div>
          <div className="text-sm">{tokenDesc}</div>
          <div className="font-bold">{formatEther(item.price)} ETH</div>
        </div>
      </div>
    </>
  );
};

export default Card;

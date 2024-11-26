import { useEffect, useState } from 'react';
import Card from './Card';
import { type NftAttribute } from '@/interface/nft';
import { useGetNftList } from '@/request/nft';
import { useWatchMarketplaceContract } from '@/tools/hooks';

const NftList = () => {
  const [nftList, setNftList] = useState<NftAttribute[]>([]);
  const { data: nftListRequest, isPending, refetch } = useGetNftList();

  const watchItemListedCallback = () => {
    refetch();
  };
  useWatchMarketplaceContract(watchItemListedCallback);

  useEffect(() => {
    if (nftListRequest) {
      setNftList(nftListRequest?.activeItems);
    }
  }, [nftListRequest]);

  const Pending = () => <div>Loading...</div>;
  const NftCard = () => {
    return (
      <div className="flex flex-wrap py-4 gap-4">
        {nftList.length ? (
          nftList.map((item) => <Card key={item.id} item={item} />)
        ) : (
          <div>No Data</div>
        )}
      </div>
    );
  };
  return <div>{isPending ? <Pending /> : <NftCard />}</div>;
};

export default NftList;

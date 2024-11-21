import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { requestUrl } from '@/constants';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import Card from './Card';

const query = gql`
  {
    activeItems(first: 5) {
      id
      buyer
      nftAddress
      tokenId
      seller
      price
    }
  }
`;

export interface NftAttr {
  id: Address;
  buyer: Address;
  nftAddress: Address;
  tokenId: string;
  seller: Address;
  price: bigint;
}

interface NftListType {
  activeItems: NftAttr[];
}

const NftList = () => {
  const [nftList, setNftList] = useState<NftAttr[]>([]);
  const { data: nftListRequest, isPending }: UseQueryResult<NftListType> = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      return await request(requestUrl, query);
    },
  });
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

import { requestUrl } from '@/constants';
import { type NftListType } from '@/interface/nft';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';

const query = gql`
  {
    activeItems(first: 10) {
      id
      buyer
      nftAddress
      tokenId
      seller
      price
    }
  }
`;

export const useGetNftList = () => {
  const result: UseQueryResult<NftListType> = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      return await request(requestUrl, query);
    },
  });
  return result;
};

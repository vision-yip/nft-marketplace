import { Address } from "viem";

export interface NftListType {
  activeItems: NftAttribute[];
}

export interface NftAttribute {
  id: Address;
  buyer: Address;
  nftAddress: Address;
  tokenId: string;
  seller: Address;
  price: bigint;
}

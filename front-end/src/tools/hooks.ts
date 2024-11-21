import { networkMapping } from "@/constants";
import { useChainId } from "wagmi";

export const useNftMarketplaceAddress = () => {
  const chainId = useChainId();
  const chainIdStr = chainId.toString();
  return networkMapping[chainIdStr as keyof typeof networkMapping]?.NftMarketplace[0] as `0x${string}`;
};

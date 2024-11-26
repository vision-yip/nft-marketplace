import { networkMapping, marketplaceAbi } from "@/constants";
import { useChainId } from "wagmi";
import client from "./viemClient";

export const useNftMarketplaceAddress = () => {
  const chainId = useChainId();
  const chainIdStr = chainId.toString();
  return networkMapping[chainIdStr as keyof typeof networkMapping]?.NftMarketplace[0] as `0x${string}`;
};

export const useWatchMarketplaceContract = (handlerFn: () => void) => {
  const unwatch = client.watchContractEvent({
    abi: marketplaceAbi,
    eventName: 'ItemListed',
    onLogs: handlerFn,
  });
  return unwatch;
}
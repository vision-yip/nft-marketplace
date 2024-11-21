import { type Address } from "viem";

export const isOwner = (address: Address, currentAddress: Address | undefined) => {
  if (!currentAddress) return false;
  return address.toLocaleLowerCase() === currentAddress.toLocaleLowerCase();
};

export const formatAddress = (address: Address, currentAddress: Address | undefined) => {
  if (isOwner(address, currentAddress)) {
    return 'You';
  }
  return address.slice(0, 6) + '...' + address.slice(-4);
};

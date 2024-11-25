import { useState } from 'react';
import { Dialog, NotificationPlugin } from 'tdesign-react';
import { formatEther } from 'viem';
import { useWriteContract } from 'wagmi';
import { useNftMarketplaceAddress } from '@/tools/hooks';
import { marketplaceAbi } from '@/constants';
import { type NftAttribute } from '@/interface/nft';

const BuyModal = ({
  open,
  onClose,
  item,
  tokenName,
}: {
  open: boolean;
  onClose: () => void;
  item: NftAttribute;
  tokenName: string;
}) => {
  const { nftAddress, tokenId, price } = item;
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const { writeContractAsync: __buyNft } = useWriteContract();
  const nftMarketplaceAddress = useNftMarketplaceAddress();
  const handleBuy = async () => {
    setConfirmLoading(true);
    try {
      await __buyNft({
        address: nftMarketplaceAddress,
        abi: marketplaceAbi,
        functionName: 'buyItem',
        args: [nftAddress, tokenId],
        value: price,
      });
      NotificationPlugin.success({
        title: 'Success',
        content: 'NFT purchased successfully',
      });
      onClose();
    } catch (error) {
      console.error(error);
      NotificationPlugin.error({
        title: 'Error',
        content: 'Failed to purchase NFT',
      });
    } finally {
      setConfirmLoading(false);
    }
  };
  return (
    <>
      <Dialog
        visible={open}
        onClose={() => onClose()}
        onCancel={() => onClose()}
        cancelBtn="Cancel"
        confirmBtn="Buy"
        onConfirm={handleBuy}
        confirmLoading={confirmLoading}
        header="Buy NFT"
      >
        <div>
          Are you sure you want to purchase this{' '}
          <span className="text-xl font-bold">
            {tokenName} #{tokenId}
          </span>{' '}
          NFT? You will pay <span className="text-xl font-bold">{formatEther(price)}</span> Eth
        </div>
      </Dialog>
    </>
  );
};

export default BuyModal;

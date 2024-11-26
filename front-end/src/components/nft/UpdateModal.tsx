import { useEffect, useState } from 'react';
import { useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { NotificationPlugin, Dialog, Input } from 'tdesign-react';

import { networkMapping, marketplaceAbi } from '@/constants';
const UpdateModal = ({
  open,
  onClose,
  nftAddress,
  tokenId,
}: {
  open: boolean;
  onClose: () => void;
  nftAddress: Address;
  tokenId: string;
}) => {
  const [newPrice, setNewPrice] = useState<string>('0');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const chainId = useChainId();
  const chainIdStr = chainId.toString();
  const nftMarketplaceAddress =
    networkMapping[chainIdStr as keyof typeof networkMapping]?.NftMarketplace[0];
  const { writeContractAsync, data: updateNftHash } = useWriteContract();
  const { isSuccess: isUpdateNftSuccess } = useWaitForTransactionReceipt({
    hash: updateNftHash,
  });

  useEffect(() => {
    if (isUpdateNftSuccess) {
      NotificationPlugin.success({
        title: 'Success',
        content: 'NFT price updated successfully',
      });
      setConfirmLoading(false);
      onClose();
    }
  }, [isUpdateNftSuccess]);

  const handleUpdate = async () => {
    try {
      if (!Number(newPrice) || Number(newPrice) <= 0) {
        NotificationPlugin.error({
          title: 'Error',
          content: 'Price must be greater than 0',
        });
        setConfirmLoading(false);
        return;
      }
      setConfirmLoading(true);
      const args = [nftAddress, tokenId, parseEther(newPrice)];
      await writeContractAsync({
        address: nftMarketplaceAddress as `0x${string}`,
        abi: marketplaceAbi,
        functionName: 'updateListing',
        args,
      });
    } catch (error) {
      console.error(error);
      NotificationPlugin.error({
        title: 'Error',
        content: 'Failed to update NFT price',
      });
      setConfirmLoading(false);
    }
  };
  return (
    <>
      <Dialog
        header="Update NFT Price"
        visible={open}
        onClose={() => onClose()}
        onCancel={() => onClose()}
        onConfirm={handleUpdate}
        cancelBtn="Cancel"
        confirmLoading={confirmLoading}
        confirmBtn="Update"
      >
        <Input value={newPrice} onChange={(e) => setNewPrice(e)} />
      </Dialog>
    </>
  );
};

export default UpdateModal;

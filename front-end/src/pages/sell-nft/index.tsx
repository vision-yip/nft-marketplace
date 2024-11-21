import { Button, type Data, Form, type FormRules, Input, NotificationPlugin } from 'tdesign-react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { validateAddress, validatePrice, validateTokenId } from '@/tools/validate';
import { useAccount } from 'wagmi';
import { type Address, formatEther, parseEther } from 'viem';
import { marketplaceAbi, basicNftAbi } from '@/constants';
import { useNftMarketplaceAddress } from '@/tools/hooks';
import { useEffect, useState } from 'react';
const { FormItem } = Form;

const rules: FormRules<Data> = {
  nftAddress: [
    { required: true, message: 'NFT Address is required!', type: 'error' },
    { validator: validateAddress },
  ],
  tokenId: [
    { required: true, message: 'Token ID is required!', type: 'error' },
    { validator: validateTokenId },
  ],
  price: [
    { required: true, message: 'Price is required!', type: 'error' },
    { validator: validatePrice },
  ],
};

const SellNft = () => {
  const nftMarketplaceAddress = useNftMarketplaceAddress();
  const { address: currentAddress } = useAccount();
  const [formData, setFormData] = useState<{ [key: string]: string }>({
    nftAddress: '',
    tokenId: '',
    price: '',
  });
  const { writeContractAsync: __approveNft, data: approveNftHash } = useWriteContract();
  const { writeContractAsync: __listingItem } = useWriteContract();
  const { writeContractAsync: __withdrawProceeds, data: withdrawProceedsHash } =
    useWriteContract();
  const { data: proceedsResult } = useReadContract({
    address: nftMarketplaceAddress,
    abi: marketplaceAbi,
    functionName: 'getProceeds',
    args: [currentAddress],
  });
  const { isSuccess: isApproveNftSuccess } = useWaitForTransactionReceipt({
    hash: approveNftHash,
  });
  const { isSuccess: isWithdrawProceedsSuccess } = useWaitForTransactionReceipt({
    hash: withdrawProceedsHash,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [proceedsNumber, setProceedsNumber] = useState<string>('0');

  useEffect(() => {
    if (isApproveNftSuccess) {
      NotificationPlugin.success({
        title: 'Success',
        content: 'NFT approved successfully, Please wait for listing',
      });
      const listingItemAsync = async () => {
        await listingItem();
      };
      listingItemAsync();
    }
  }, [isApproveNftSuccess]);
  useEffect(() => {
    if (isWithdrawProceedsSuccess) {
      NotificationPlugin.success({
        title: 'Success',
        content: 'Withdraw proceeds successfully',
      });
    }
  }, [isWithdrawProceedsSuccess]);
  useEffect(() => {
    if (proceedsResult) {
      setProceedsNumber(Number(proceedsResult).toString());
    }
  }, [proceedsResult]);

  const handleSubmit = async (data: Data) => {
    const { fields, firstError, validateResult } = data;
    const { nftAddress, tokenId } = fields;
    if (firstError || validateResult.length) {
      NotificationPlugin.error({
        title: 'Error',
        content: 'Please check the form',
      });
      return;
    }
    setConfirmLoading(true);
    setFormData(fields);
    await approveNft(nftAddress, tokenId);
  };

  const approveNft = async (nftAddress: Address, tokenId: Address) => {
    const args = [nftMarketplaceAddress, tokenId];
    try {
      await __approveNft({
        address: nftAddress,
        abi: basicNftAbi,
        functionName: 'approve',
        args,
      });
    } catch (error) {
      console.log(error);
      setConfirmLoading(false);
      NotificationPlugin.error({
        title: 'Error',
        content: 'Failed to approve NFT, Unknown error',
      });
    }
  };
  const listingItem = async () => {
    const { nftAddress: nftAddressForm, tokenId: tokenIdForm, price: priceForm } = formData;
    const args = [nftAddressForm, tokenIdForm, parseEther(priceForm)];
    try {
      await __listingItem({
        address: nftMarketplaceAddress,
        abi: marketplaceAbi,
        functionName: 'listItem',
        args,
      });
      NotificationPlugin.success({
        title: 'Success',
        content: 'Item listed successfully',
      });
    } catch (error) {
      console.log(error);
      NotificationPlugin.error({
        title: 'Error',
        content: 'Failed to list item, Unknown error',
      });
    } finally {
      setConfirmLoading(false);
    }
  };
  const handleWithdraw = async () => {
    try {
      console.log('Withdraw start...');
      setWithdrawLoading(true);
      await __withdrawProceeds({
        address: nftMarketplaceAddress,
        abi: marketplaceAbi,
        functionName: 'withdrawProceeds',
      });
      NotificationPlugin.success({
        title: 'Success',
        content: 'Withdraw proceeds successfully',
      });
      console.log('Withdraw end');
    } catch (error) {
      console.log(error);
      NotificationPlugin.error({
        title: 'Error',
        content: 'Failed to withdraw proceeds, Unknown error',
      });
    } finally {
      setWithdrawLoading(false);
    }
  };
  return (
    <div className="p-4">
      <div className="w-1/2">
        <h1 className="text-2xl font-bold">List NFT</h1>
        <Form rules={rules} onSubmit={handleSubmit}>
          <FormItem name="nftAddress" label="NFT Address">
            <Input placeholder="NFT Address" />
          </FormItem>
          <FormItem name="tokenId" label="Token ID">
            <Input placeholder="Token ID" />
          </FormItem>
          <FormItem name="price" label="Price">
            <Input placeholder="Price" />
          </FormItem>
          <FormItem>
            <Button type="submit" loading={confirmLoading}>
              Submit
            </Button>
          </FormItem>
        </Form>
      </div>
      <div className="mt-4">
        <h1 className="text-2xl font-bold">Withdraw Proceeds</h1>
        <p className="text-sm text-gray-500">
          Withdraw <span className="text-xl font-bold">{formatEther(BigInt(proceedsNumber))}</span>{' '}
          proceeds from the sale of your NFTs.
        </p>
        <Button
          disabled={proceedsNumber === '0'}
          onClick={handleWithdraw}
          loading={withdrawLoading}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
};

export default SellNft;

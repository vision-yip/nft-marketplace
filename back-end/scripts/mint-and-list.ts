import { ethers } from "hardhat";
import { BasicNft, NftMarketplace } from "../typechain-types";
const PRICE = ethers.parseEther('1');

const mintAndList = async () => {
  const basicNft = await ethers.getContract<BasicNft>('BasicNft');
  const nftMarketplace = await ethers.getContract<NftMarketplace>('NftMarketplace');
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt?.logs[0].topics[1];
  console.log(`Minted NFT with tokenId: ${tokenId}`);
  const approvetX = await basicNft.approve(nftMarketplace.target, 0);
  await approvetX.wait(1);
  const listItemTx = await nftMarketplace.listItem(basicNft.target, 0, PRICE);
  await listItemTx.wait(1);
  console.log('NFT listed');
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

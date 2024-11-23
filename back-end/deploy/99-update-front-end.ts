import fs from 'fs';
import { ethers, network } from 'hardhat';
const frontEndContractsFile = '../front-end/src/constants/networkMapping.json';
const frontEndAbiLocation = '../front-end/src/constants/';

const deployUpdateFrontEnd = async () => {
  await updateContractAddresses();
  await updateAbi();
};

const updateContractAddresses = async () => {
  const nftMarketplace = await ethers.getContract('NftMarketplace');
  const chainId = network?.config?.chainId?.toString() || '';
  const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, 'utf-8'));
  if (!(chainId in contractAddresses)) {
    contractAddresses[chainId] = {};
  }
  if (chainId in contractAddresses && 'NftMarketplace' in contractAddresses[chainId]) {
    if (!contractAddresses[chainId]['NftMarketplace'].includes(nftMarketplace.target)) {
      contractAddresses[chainId]['NftMarketplace'].push(nftMarketplace.target);
    }
  } else {
    contractAddresses[chainId]['NftMarketplace'] = [nftMarketplace.target];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

const updateAbi = async () => {
  const nftMarketplace = await ethers.getContract('NftMarketplace');
  fs.writeFileSync(`${frontEndAbiLocation}marketplaceAbi.json`, JSON.stringify(nftMarketplace.interface.fragments));
  const basicNft = await ethers.getContract('BasicNft');
  fs.writeFileSync(`${frontEndAbiLocation}basicNftAbi.json`, JSON.stringify(basicNft.interface.fragments));
}

export default deployUpdateFrontEnd;
deployUpdateFrontEnd.tags = ['all', 'frontend'];
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { network } from 'hardhat';
import { developmentChains, networkConfig } from '../helper.hardhat.config';
import { verify } from '../utils/verify';

const deployNftMarketplace: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  console.log('Deploying NftMarketplace...');
  const chainName = network.name as keyof typeof networkConfig;
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const args: any[] = [];

  const nftMarketplace = await deploy('NftMarketplace', {
    from: deployer,
    log: true,
    args,
    waitConfirmations: networkConfig?.[chainName]?.blockConfirmations || 1,
  });
  console.log('NftMarketplace deployed to:', nftMarketplace.address);
  if (!developmentChains.includes(chainName) && process.env.ETHERSCAN_API_KEY) {
    console.log('Verifying NftMarketplace contract...');
    await verify(nftMarketplace.address, args);
  }
};

export default deployNftMarketplace;
deployNftMarketplace.tags = ['all', 'nftMarketplace'];
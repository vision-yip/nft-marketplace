import { developmentChains, networkConfig } from '../helper.hardhat.config';
import { verify } from '../utils/verify';
import { HardhatRuntimeEnvironment} from 'hardhat/types'
import { network } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types';

const deployBasicNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  console.log('Deploying BasicNft...'); 
  const chainName = network.name as keyof typeof networkConfig;
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const args: any[] = [];
  const basicNft = await deploy('BasicNft', {
    from: deployer,
    log: true,
    args,
    waitConfirmations: networkConfig?.[chainName]?.blockConfirmations || 1,
  });
  console.log('BasicNft deployed to:', basicNft.address);
  if (!developmentChains.includes(chainName) && process.env.ETHERSCAN_API_KEY) {
    console.log('Verifying BasicNft contract...');
    await verify(basicNft.address, args);
  }
};

export default deployBasicNft;
deployBasicNft.tags = ['all', 'basicNft'];


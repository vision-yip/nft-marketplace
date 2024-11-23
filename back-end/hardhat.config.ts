
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'dotenv/config';
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy-ethers';
import { type HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-chai-matchers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';
const PRIVATE_KEY = process.env.PRIVATE_KEY || ZERO_ADDRESS;
const PRIVATE1_KEY = process.env.PRIVATE1_KEY || ZERO_ADDRESS;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || '';
console.log(PRIVATE_KEY);
console.log(PRIVATE1_KEY);
console.log(ETHERSCAN_API_KEY);
console.log(SEPOLIA_RPC_URL);


const config: HardhatUserConfig = {
  solidity: '0.8.27',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [PRIVATE_KEY, PRIVATE1_KEY],
    },
    localhost: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  // typechain: {
  //   outDir: 'typechain',
  //   target: 'ethers-v6',
  // },
};

export default config;

/** @type import('hardhat/config').HardhatUserConfig */
require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');
require('dotenv').config();
require('@nomicfoundation/hardhat-ethers');
require('hardhat-deploy-ethers');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE1_KEY = process.env.PRIVATE1_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
console.log(PRIVATE_KEY);
console.log(PRIVATE1_KEY);
console.log(ETHERSCAN_API_KEY);
console.log(SEPOLIA_RPC_URL);

module.exports = {
  solidity: '0.8.27',
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      blockConfirmations: 6,
      accounts: [PRIVATE_KEY, PRIVATE1_KEY],
    },
    localhost: {
      chainId: 31337,
      blockConfirmations: 1,
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
};

const { network } = require('hardhat');
const { developmentChains } = require('../helper.hardhat.config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [];
  console.log(deployer);
  const nftMarketplace = await deploy('NftMarketplace', {
    from: deployer,
    log: true,
    args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log('NftMarketplace deployed to:', nftMarketplace.address);
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log('Verifying contract...');
    await verify(nftMarketplace.address, args);
  }
};

module.exports.tags = ['all', 'nftMarketplace'];
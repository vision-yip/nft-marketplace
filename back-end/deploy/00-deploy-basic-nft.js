const { developmentChains } = require('../helper.hardhat.config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const basicNft = await deploy('BasicNft', {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log('Verifying contract...');
    await verify(basicNft.address, []);
  }
};

module.exports.tags = ['all', 'basicNft'];

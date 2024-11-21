# NFT Marketplace back-end

## Contracts Main Functions

1. `listItem`: 获取 NFTs
2. `buyItem`: 购买 NFT
3. `cancelItem`: 取消 NFT
4. `updateListing`: 更新 NFT
5. `withdrawProceeds`: 提取收益

### Getting Started

```bash
// clone
git clone git@github.com:vision-yip/nft-marketplace.git
cd back-end
pnpm install

// test
hardhat test

// compile
hardhat compile

// deploy
hardhat deploy

// run local node
hardhat node

// mint a new NFT and list it
hardhat run ./scripts/mint-and-list.ts

```

### Environment

1. Create a `.env` file in the root directory and add the following:
2. Replace the placeholder values with your own.

```
ETHERSCAN_API_KEY=${ETHERSCAN_API_KEY}
PRIVATE_KEY=${PRIVATE_KEY}
PRIVATE1_KEY=${PRIVATE1_KEY}
SEPOLIA_RPC_URL=${SEPOLIA_RPC_URL}
```

import { ethers } from 'hardhat';
import { NftMarketplace, BasicNft } from '../../typechain-types';
import { deployments } from 'hardhat';
import { expect} from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';


describe('NftMarketplace', () => {
  const PRICE = ethers.parseEther('1');
  const TOKEN_ID = 0;
  let nftMarketplace: NftMarketplace;
  let deployer: SignerWithAddress;
  let player: SignerWithAddress;
  let basicNft: BasicNft;
  beforeEach(async () => {
    await deployments.fixture(['all']);
    nftMarketplace = await ethers.getContract<NftMarketplace>('NftMarketplace');
    basicNft = await ethers.getContract<BasicNft>('BasicNft');
    const signers = await ethers.getSigners();
    deployer = signers[0];
    player = signers[1];
  });
  describe('listItem checks', () => {
    it('price 0, listiItem failed, return NftMarketplace__PriceMustBeAboveZero', async () => {
      await expect(nftMarketplace.listItem(basicNft.target, TOKEN_ID, 0)).to.be.revertedWithCustomError(
        nftMarketplace,
        'NftMarketplace__PriceMustBeAboveZero'
      );
    });
    it('price 1, not listed, not approved, is owner, listiItem failed, return NftMarketplace__NotApprovedForMarketplace', async () => {
      await basicNft.mintNft();
      await expect(nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(
        nftMarketplace,
        'NftMarketplace__NotApprovedForMarketplace'
      );
    });
    it('price 1, in listed, is approved, is owner, listiItem failed, return NftMarketplace__AlreadyListed', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await expect(nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(
        nftMarketplace,
        'NftMarketplace__AlreadyListed'
      );
    });
    it('price 1, not listed, is approved, no owner, listiItem failed, return NftMarketplace__NotOwner', async () => {
      await basicNft.connect(player).mintNft();
      await expect(nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NotOwner');
    });
    it('price 1, not listed, is approved, is owner, listItem successfully, emit successfully, getListing successfully', async() => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await expect(nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)).to.be.emit(nftMarketplace, 'ItemListed').withArgs(deployer.address, basicNft.target, TOKEN_ID, PRICE);
      const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID);
      expect(listing.price).to.equal(PRICE);
      expect(listing.seller).to.equal(deployer.address);
    });
  });
  describe('buyItem checks', () => {
    it('not listed, buyItem failed, return NftMarketplace__NotListed', async () => {
      await expect(nftMarketplace.buyItem(basicNft.target, TOKEN_ID)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NotListed');
    })
    it('price 0.1, listed, buyItem failed, return NftMarketplace__PriceNotMet', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await expect(nftMarketplace.buyItem(basicNft.target, TOKEN_ID, { value: ethers.parseEther('0.1') })).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__PriceNotMet');
    });
    it('price 1, listed, buyItem successfully, emit successfully, getListing successfully, getProceeds successfully', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, 0);
      await nftMarketplace.listItem(basicNft.target, 0, PRICE);
      await expect(nftMarketplace.buyItem(basicNft.target, TOKEN_ID, { value: PRICE })).to.be.emit(nftMarketplace, 'ItemBought').withArgs(deployer.address, basicNft.target, TOKEN_ID, PRICE);
      const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID);
      expect(listing.price).to.be.equal(0);
      const proceeds = await nftMarketplace.getProceeds(deployer.address);
      expect(proceeds).to.equal(PRICE);
    });
  });
  describe('cancelListing checks', () => {
    it('listed, not owner, cancelListing failed, return NftMarketplace__NotOwner', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await expect(nftMarketplace.connect(player).cancelListing(basicNft.target, TOKEN_ID)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NotOwner');
    });
    it('not listed, is owner, cancelListing failed, return NftMarketplace__NotListed', async () => {
      await expect(nftMarketplace.cancelListing(basicNft.target, TOKEN_ID)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NotListed');
    });
    it('listed, is owner, cancelListing successfully, emit successfully, getListing successfully', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await expect(nftMarketplace.cancelListing(basicNft.target, TOKEN_ID)).to.be.emit(nftMarketplace, 'ItemCanceled').withArgs(deployer.address, basicNft.target, TOKEN_ID);
      const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID);
      expect(listing.price).to.equal(0);
    });
  });
  describe('updateListing checks', () => {
    it('not listed, price 1, is owner, updateListing failed, return NftMarketplace__NotListed', async () => {
      await expect(nftMarketplace.updateListing(basicNft.target, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NotListed');
    })
    it('listed, price 0, updateListing failed, return NftMarketplace__PriceMustBeAboveZero', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await expect(nftMarketplace.updateListing(basicNft.target, TOKEN_ID, 0)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__PriceMustBeAboveZero');
    });
    it('listedprice 1, not owner, updateListing failed, return NftMarketplace__NotOwner', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await expect(nftMarketplace.connect(player).updateListing(basicNft.target, TOKEN_ID, PRICE)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NotOwner');
    });
    it('listed, price 2, is owner, updateListing successfully, emit successfully, getListing successfully', async () => {
      const newPrice = ethers.parseEther('2');
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await expect(nftMarketplace.updateListing(basicNft.target, TOKEN_ID, newPrice)).to.be.emit(nftMarketplace, 'ItemListed').withArgs(deployer.address, basicNft.target, TOKEN_ID, newPrice);
      const listing = await nftMarketplace.getListing(basicNft.target, TOKEN_ID);
      expect(listing.price).to.equal(newPrice);
    });
  });
  describe('withdrawProceeds checks', () => {
    it('no proceeds, withdrawProceeds failed, return NftMarketplace__NoProceeds', async () => {
      await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NoProceeds');
    });
    it('proceeds 1, withdrawProceeds successfully, getProceeds successfully', async () => {
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.target, TOKEN_ID);
      await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
      await nftMarketplace.buyItem(basicNft.target, TOKEN_ID, { value: PRICE });
      await nftMarketplace.withdrawProceeds();
      const proceeds = await nftMarketplace.getProceeds(deployer.address);
      expect(proceeds).to.equal(0);
    });
  });
});

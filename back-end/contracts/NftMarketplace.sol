// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

contract NftMarketplace is ReentrancyGuard {
  // NFT contract address -> tokenId -> listing
  struct Listing {
    address seller;
    uint256 price;
  }
  mapping(address => mapping(uint256 => Listing)) private s_listings;
  // 卖家的地址 -> 卖家的收益
  mapping(address => uint256) private s_proceeds;

  event ItemListed(
    address indexed seller,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );
  event ItemBought(
    address indexed buyer,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );
  event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId);
  event ItemUpdated(
    address indexed seller,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );

  // 检验是否在出售列表. 如果NFT已经在出售列表中了, 则不能再次上架
  modifier notListed(
    address nftAddress,
    uint256 tokenId,
    address owner
  ) {
    Listing memory listing = s_listings[nftAddress][tokenId];
    if (listing.price > 0) {
      revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
    }
    _;
  }
  // 检查是否是一个list
  modifier isListed(address nftAddress, uint256 tokenId) {
    Listing memory listing = s_listings[nftAddress][tokenId];
    if (listing.price <= 0) {
      revert NftMarketplace__NotListed(nftAddress, tokenId);
    }
    _;
  }
  modifier isOwner(
    address nftAddress,
    uint256 tokenId,
    address spender
  ) {
    IERC721 nft = IERC721(nftAddress);
    address owner = nft.ownerOf(tokenId);
    if (spender != owner) {
      revert NftMarketplace__NotOwner();
    }
    _;
  }
  modifier priceMustBeAboveZero(uint256 price) {
    if (price <= 0) {
      revert NftMarketplace__PriceMustBeAboveZero();
    }
    _;
  }

  /**
   * @dev 上架NFT
   * @param nftAddress NFT地址
   * @param tokenId NFT的tokenId
   * @param price 价格
   */
  function listItem(
    address nftAddress,
    uint256 tokenId,
    uint256 price // todo: 后续使用data feel实现, 使用稳定币
  )
    external
    priceMustBeAboveZero(price)
    notListed(nftAddress, tokenId, msg.sender)
    isOwner(nftAddress, tokenId, msg.sender)
  {
    // 1. 获取NFT.调用者把NFT转给合约;
    // 2. 把NFT的权限转给合约, 这样合约可以代表调用者出售NFT;
    if (IERC721(nftAddress).getApproved(tokenId) != address(this)) {
      revert NftMarketplace__NotApprovedForMarketplace();
    }
    s_listings[nftAddress][tokenId] = Listing(msg.sender, price);
    emit ItemListed(msg.sender, nftAddress, tokenId, price);
  }

  /**
   * @dev nonReentrant 防止重入攻击. 所有的payable函数都应该先清空数据后再转账.
   * 1. 检查NFT是否在出售列表中
   * 2. 检查价格是否足够
   * 3. 转账到卖家合约钱包
   * 4. 删除出售记录
   * 5. NFT转给买家
   * @param nftAddress NFT地址
   * @param tokenId NFT的tokenId
   */
  function buyItem(
    address nftAddress,
    uint256 tokenId
  ) external payable nonReentrant isListed(nftAddress, tokenId) {
    Listing memory listedItem = s_listings[nftAddress][tokenId];
    // 检查价格是否足够
    if (msg.value < listedItem.price) {
      revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
    }
    // 转账到卖家合约钱包
    s_proceeds[listedItem.seller] += msg.value;
    // 删除出售记录
    delete s_listings[nftAddress][tokenId];
    // NFT转给买家
    IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
    emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
  }

  /**
   * @dev 取消出售
   * @param nftAddress NFT地址
   * @param tokenId NFT的tokenId
   */
  function cancelListing(
    address nftAddress,
    uint256 tokenId
  ) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
    delete s_listings[nftAddress][tokenId];
    emit ItemCanceled(msg.sender, nftAddress, tokenId);
  }

  /**
   * @dev 更新出售价格
   * @param nftAddress NFT地址
   * @param tokenId NFT的tokenId
   * @param newPrice 新价格
   */
  function updateListing(
    address nftAddress,
    uint256 tokenId,
    uint256 newPrice
  )
    external
    isListed(nftAddress, tokenId)
    priceMustBeAboveZero(newPrice)
    isOwner(nftAddress, tokenId, msg.sender)
  {
    s_listings[nftAddress][tokenId].price = newPrice;
    emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
  }

  /**
   * @dev 提现收益
   */
  function withdrawProceeds() external {
    uint256 proceeds = s_proceeds[msg.sender];
    if (proceeds <= 0) {
      revert NftMarketplace__NoProceeds();
    }
    s_proceeds[msg.sender] = 0;
    (bool success, ) = payable(msg.sender).call{value: proceeds}('');
    if (!success) {
      revert NftMarketplace__TransferFailed();
    }
  }

  /**
   * @dev 获取出售记录
   * @param nftAddress NFT地址
   * @param tokenId NFT的tokenId
   * @return 出售记录
   */
  function getListing(address nftAddress, uint256 tokenId) external view returns (Listing memory) {
    return s_listings[nftAddress][tokenId];
  }

  /**
   * @dev 获取卖家的收益
   * @param seller 卖家的地址
   * @return 卖家的收益
   */
  function getProceeds(address seller) external view returns (uint256) {
    return s_proceeds[seller];
  }
}

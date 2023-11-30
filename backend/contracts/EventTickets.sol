// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract EventTickets is ERC721URIStorage, Ownable {
    using Strings for uint256;
    event SellingStarted();
    event emitInSecondMarket(uint256);

    uint8 constant MAX_CATEGORY = 8;
    bool isSaleActive;

    struct Category {
        string category;
        uint32 price;
        uint32 quantity;
        uint32 thresholdResalePrice;
    }

    uint256 eventDate;

    mapping(string => mapping(uint32 => bool)) mintedSeat;

    mapping(uint256 => uint8) tokenIdsPerCategories;

    mapping(uint256 => uint32) public secondMarketTokenIdsByPrice;

    Category[] eventCategories;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _eventDate
    ) ERC721(_tokenName, _tokenSymbol) Ownable(msg.sender) {
        eventDate = _eventDate;
    }

    function date() external view returns (uint256) {
        return eventDate;
    }

    function getCategories() external view returns (Category[] memory) {
        return eventCategories;
    }

    function categories(Category[] memory _categories) external onlyOwner {
        require(_categories.length < MAX_CATEGORY, "8 categories max");
        require(!isSaleActive, "sell is started");
        for (uint32 i = 0; i < _categories.length; i++) {
            eventCategories.push(_categories[i]);
        }
    }

    function startSell() external onlyOwner {
        require(eventCategories.length > 0, "No categories provided");
        isSaleActive = true;
        emit SellingStarted();
    }

    function buy(
        uint32 _seat,
        string calldata _category,
        string memory _tokenUri
    ) public payable returns (uint256) {
        require(isSaleActive, "Sale is not opened");

        require(block.timestamp < eventDate, "past event");

        (Category memory cat, uint8 index) = getCategory(_category);

        require(msg.value >= cat.price * 1 wei, "Not enought money");

        require(_seat > 0 && _seat < cat.quantity, "Invalid seatNumber");
        require(!mintedSeat[_category][_seat], "Already taken");

        mintedSeat[_category][_seat] = true;

        uint256 tokenId = uint256(
            keccak256(abi.encodePacked(_category, Strings.toString(_seat)))
        );

        tokenIdsPerCategories[tokenId] = index;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenUri);

        return tokenId;
    }

    function sell(uint256 tokenId, uint32 price) external {
        require(msg.sender == ownerOf(tokenId), "Not owner.");
        require(
            price <=
                eventCategories[tokenIdsPerCategories[tokenId]]
                    .thresholdResalePrice,
            "Price exceed."
        );
        require(block.timestamp < eventDate, "past event");
        secondMarketTokenIdsByPrice[tokenId] = price;
        emit emitInSecondMarket(tokenId);
    }

    function getCategory(
        string memory _category
    ) private view returns (Category memory, uint8 index) {
        for (uint8 i = 0; i < eventCategories.length; i++) {
            if (
                keccak256(abi.encodePacked(_category)) ==
                keccak256(abi.encodePacked(eventCategories[i].category))
            ) {
                return (eventCategories[i], i);
            }
        }
        revert("Category unknown");
    }
}

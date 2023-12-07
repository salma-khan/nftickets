// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract EventTickets is
    AutomationCompatibleInterface,
    ERC721URIStorage,
    Ownable
{
    using Strings for uint256;
    event SellingStarted();
    event emitInSecondMarket(uint256);

    address public  forwarder;
    address public admin;

    uint8 constant MAX_CATEGORY = 8;

    struct Category {
        string category;
        uint32 price;
        uint32 quantity;
        uint32 thresholdResalePrice;
    }

    enum TicketStatus {
        ACTIVE,
        DESACTIVATED
    }

    enum EventStatus {
        TICKET_SALES_NOT_OPEN,
        TICKET_SALES_OPEN,
        EVENT_FINISH
    }

    struct TokenForResale {
        bool forSale;
        uint32 price;
    }


    struct EventMeta{
        uint256 date;
        string desc;
        string location;
       
    }

    
    mapping(string => mapping(uint32 => bool)) mintedSeat;

    mapping(uint256 => uint8) tokenIdsPerCategories;

    mapping(uint256 => TokenForResale) public secondMarketToken;

    Category[] eventCategories;

    EventStatus public eventStatus;
    EventMeta public eventMeta;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        EventMeta memory  _eventMeta , address _admin, Category[] memory  _categories
    ) ERC721(_tokenName, _tokenSymbol) Ownable(msg.sender) {
        require(_categories.length < MAX_CATEGORY, "8 categories max");
        for (uint32 i = 0; i < _categories.length; i++) {
            eventCategories.push(_categories[i]);
        }
        eventMeta = _eventMeta;
        admin = _admin;

    }

    modifier requireSaleIsNotOpen() {
        require(
            eventStatus == EventStatus.TICKET_SALES_NOT_OPEN,
            "Sale is started"
        );
        _;
    }

    modifier requireSaleIsOpen() {
        require(
            eventStatus == EventStatus.TICKET_SALES_OPEN,
            "Sale is not open"
        );
        _;
    }

       modifier requirePastEvent() {
        require(
            eventStatus == EventStatus.EVENT_FINISH,
            "Event did not occures"
        );
        _;
    }


    function startSell() external onlyOwner requireSaleIsNotOpen {
        eventStatus = EventStatus.TICKET_SALES_OPEN;
        emit SellingStarted();
    }

    function buy(
        uint32 _seat,
        string calldata _category,
        string memory _tokenUri
    ) public payable requireSaleIsOpen returns (uint256) {
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

    function sell(uint256 tokenId, uint32 price) external requireSaleIsOpen {
        require(msg.sender == ownerOf(tokenId), "Not owner.");
        require(
            price > 0 &&
                price <=
                eventCategories[tokenIdsPerCategories[tokenId]]
                    .thresholdResalePrice,
            "Price exceed."
        );
    

        secondMarketToken[tokenId] = TokenForResale(true, price);
        emit emitInSecondMarket(tokenId);
    }

    function buySecondMarket(
        uint256 tokenId
    ) external payable requireSaleIsOpen {
        require(secondMarketToken[tokenId].forSale, "Token not for sale");
        require(
            msg.value >= secondMarketToken[tokenId].price * 1 wei,
            "Not enought money."
        );
        address tokenOwner = ownerOf(tokenId);
        delete secondMarketToken[tokenId];
        _transfer(tokenOwner, msg.sender, tokenId);
        (bool sent, ) = tokenOwner.call{value: msg.value}("");
        require(sent, "Failed to perform transaction");
    }

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        uint timesUp =  eventMeta.date + 3 hours;
       upkeepNeeded =  block.timestamp> timesUp;
    }

    function performUpkeep(
        bytes calldata 
    ) external override {
        require(msg.sender == forwarder,"Not valid");
        eventStatus = EventStatus.EVENT_FINISH;
    }

    function setForwarderAddress(address _forwarderAddress) external {
        require(msg.sender == admin, "Not admin");
        forwarder = _forwarderAddress;
    }

   function setAdmin(address _admin) external {
        require(msg.sender == admin, "Not admin");
        admin= _admin;
    }

   function withdraw() external onlyOwner requirePastEvent {
    (bool sent, ) =  msg.sender.call{value: address(this).balance}("");
    require(sent, "Failed to perform transaction");

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

  

    function getCategories() external view returns (Category[] memory) {
        return eventCategories;
    }
}

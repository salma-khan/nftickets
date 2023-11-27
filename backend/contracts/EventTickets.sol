// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EventTickets is ERC721, Ownable {
    event SellingStarted(address);

    uint256 eventDate;
    mapping(string => Ticket) ticketCategories;
    bool isSaleActive;

    struct Ticket {
        uint32 price;
        uint32 quantity;
    }

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint _date
    ) ERC721(tokenName, tokenSymbol) Ownable(msg.sender) {
        eventDate = _date;
    }

    function date() external view returns (uint256) {
        return eventDate;
    }

    function category(
        string calldata _category,
        uint32 quantity,
        uint32 price
    ) external onlyOwner {
        require(!isSaleActive, "sell is started");
        require(bytes(_category).length > 0, "Empty category");
        require(quantity > 0, "seats should be >0");
        Ticket memory _ticket = Ticket(price, quantity);
        ticketCategories[_category] = _ticket;
    }

    function startSell() external onlyOwner {
        isSaleActive = true;
        emit SellingStarted(address(this));
    }

    function buy(string calldata category, uint count) public payable {
        // require category not empty
        // require count not zero
        //require total supply of the category + count < quantity of the category
        //Require price * quantity >= msg.value
        // update the total supply
    }
}

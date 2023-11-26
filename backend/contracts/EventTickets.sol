// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EventTickets is ERC721, Ownable {
    uint256 date;
    

    constructor(
        string memory tokenName,
        string memory tokenSymbol, uint date
    ) ERC721(tokenName, tokenSymbol) Ownable(msg.sender) {}
}

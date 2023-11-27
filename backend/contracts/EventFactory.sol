// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./EventTickets.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract EventFactory {
    event EventCreated(address ticketAddress);

    function create(
        string calldata eventName,
        string calldata eventSymbol, uint256 date
    ) external   {
        bytes32 _salt = keccak256(abi.encodePacked(eventName));
        address addr =  Create2.deploy(
            0,
            _salt,
            abi.encodePacked(
                type(EventTickets).creationCode,
                abi.encode(eventName, eventSymbol, date)
            )
        );
        
       EventTickets(addr).transferOwnership(msg.sender);
        emit EventCreated(addr);
      
    }
}

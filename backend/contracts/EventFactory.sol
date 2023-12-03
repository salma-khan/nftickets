// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./EventTickets.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "./AutomationRegistrarInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EventFactory is Ownable {
    event EventCreated(address ticketAddress);
    event EventRegistered(uint upkeepID);

    address public  link;
    address  public registrar;


    constructor(address _link, address _registrar) Ownable(msg.sender){
        link = _link;
        registrar = _registrar;  
   
    }

    function create(
        string calldata eventName,
        string calldata eventSymbol,
        uint256 date
    ) external {
        bytes32 _salt = keccak256(abi.encodePacked(eventName));
        address addr = Create2.deploy(
            0,
            _salt,
            abi.encodePacked(
                type(EventTickets).creationCode,
                abi.encode(eventName, eventSymbol, date)
            )
        );

        EventTickets(addr).transferOwnership(msg.sender);
        register(addr, eventName);
        emit EventCreated(addr);
    }

    function register(address _deployedContract, string memory eventName) private {
        RegistrationParams memory registrationData = RegistrationParams(
            eventName,
            hex"",
            _deployedContract,
            500000,
            owner(),
            0,
            hex"",
            hex"",
            hex"",
            5000000000000000000
        );
        LinkTokenInterface(link).approve(registrar, 5000000000000000000);
        uint256 upkeepID = AutomationRegistrarInterface(registrar)
            .registerUpkeep(registrationData);
        if (upkeepID != 0) {
            emit EventRegistered(upkeepID);
        } else {
            revert("Unable to approve");
        }
    }

    function setLinkAddress(address _link) external  onlyOwner{
        link = _link;
    }

     function setRegistrar(address _registrar) external onlyOwner {
        registrar = _registrar;
    }
}



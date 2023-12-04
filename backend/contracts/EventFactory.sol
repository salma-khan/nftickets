// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./EventTickets.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IKeeperRegistryMaster} from "@chainlink/contracts/src/v0.8/automation/interfaces/v2_1/IKeeperRegistryMaster.sol";

import "./AutomationRegistrarInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EventFactory is Ownable {
    event EventCreated(address ticketAddress);
    event EventRegistered(uint upkeepID);

    address public  link;
    address  public registrar;
    address public registry;
    address admin;
    uint8 constant MAX_CATEGORY = 8;

    struct Category {
        string category;
        uint32 price;
        uint32 quantity;
        uint32 thresholdResalePrice;
    }



    constructor(address _link, address _registrar, address _registry) Ownable(msg.sender){
        link = _link;
        registrar = _registrar;
        registry = _registry;
        admin = msg.sender;
    }

    function create(
        string calldata eventName,
        string calldata eventSymbol,
        uint256 date,
        Category[] memory  categories

    ) external {
        require(categories.length < MAX_CATEGORY, "8 categories max");
        bytes32 _salt = keccak256(abi.encodePacked(eventName));
        address addr = Create2.deploy(
            0,
            _salt,
            abi.encodePacked(
                type(EventTickets).creationCode,
                abi.encode(eventName, eventSymbol, date, address(this), categories)
            )
        );

       
        uint keepUpId= register(addr, eventName);
        EventTickets(addr).setForwarderAddress(IKeeperRegistryMaster(registry).getForwarder(keepUpId));
        EventTickets(addr).setAdmin(admin);

        EventTickets(addr).transferOwnership(msg.sender);
        emit EventCreated(addr);
    }

    function register(address _deployedContract, string memory eventName) private  returns (uint) {
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
        return upkeepID;
    }

    function setLinkAddress(address _link) external  onlyOwner{
        link = _link;
    }

     function setRegistrar(address _registrar) external onlyOwner {
        registrar = _registrar;
    }
}



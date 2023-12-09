// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "./EventTickets.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IKeeperRegistryMaster} from "@chainlink/contracts/src/v0.8/automation/interfaces/v2_1/IKeeperRegistryMaster.sol";

import "./AutomationRegistrarInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EventFactory is Ownable {
    event EventCreated(address indexed ticketAddress , address  indexed owner);
    event EventRegistered(uint upkeepID);

    address public  link;
    address  public registrar;
    address public registry;
    address admin;


    struct Category {
        string category;
        uint32 price;
        uint32 quantity;
        uint32 threshold;
    }

    struct EventMeta{
        uint256 date;
        string desc;
        string location;
        
       
    }

   constructor(address _link, address _registrar, address _registry) Ownable(msg.sender){
        link = _link;
        registrar = _registrar;
        registry = _registry;
        admin = msg.sender;
    }

    function create(
        string calldata name,
        string calldata symb,
        uint256 date,
        string calldata desc,
        string calldata location,
        Category[] calldata categories

    )  external  {
        require(categories.length < 8, "8 categories max");
        bytes32 _salt = keccak256(abi.encodePacked(name));
        EventMeta  memory e = EventMeta(date, desc, location);
        bytes memory code = abi.encodePacked(
                type(EventTickets).creationCode,
               abi.encode(name, symb, e, address(this), categories));
        address addr = Create2.deploy(
            0,
            _salt,
            code
        );

        uint keepUpId= register(addr);
        EventTickets(addr).setForwarderAddress(IKeeperRegistryMaster(registry).getForwarder(keepUpId));
        EventTickets(addr).setAdmin(admin);

        EventTickets(addr).transferOwnership(msg.sender);
        emit EventCreated(addr, msg.sender);
    }

    function register(address _deployedContract) private  returns (uint) {
        RegistrationParams memory registrationData = RegistrationParams(
            "Fact",
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



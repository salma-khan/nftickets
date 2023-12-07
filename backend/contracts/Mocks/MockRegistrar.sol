
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "./../AutomationRegistrarInterface.sol";

contract MockRegistrar is AutomationRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external pure  returns  (uint256){
       return 1;
     
    }

}

contract MockRegistrarError is AutomationRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external pure returns (uint256){
      return 0;
    }

}


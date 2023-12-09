
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;



contract MockRegistry {
   
    function getForwarder(uint256 upkeepId) external view returns (address){
       return address(bytes20(keccak256(abi.encode(block.timestamp))));
    }

}
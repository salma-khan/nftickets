
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract MockLinkToken {
    event LinkTransferred(uint256 amount);
    event Approved();

    function transfer(address to, uint256 value) external returns (bool success){
        emit LinkTransferred(value);
    }

    function approve(address spender, uint256 value) external returns (bool success) {
      emit Approved();
    }

    function decimals() external view returns (uint8 decimalPlaces){
        return 1;
    }

   
    function balanceOf(address adr) external view returns( uint256) {
        return 5;
    }

}
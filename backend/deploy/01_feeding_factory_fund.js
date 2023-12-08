const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helpers-hardhat-config");
const LINK_TOKEN_ABI = require("@chainlink/contracts/abi/v0.8/LinkTokenInterface.json")

module.exports = async (hre) =>{

    const chainId = network.config.chainId;
    let LinkToken = "";
    
    if(chainId ==31337){
        LinkToken = await hre.ethers.getContract('MockLinkToken');
     
    } else {
         LinkToken = await ethers.getContractAt(LINK_TOKEN_ABI,networkConfig[chainId].link_token);
       
    }
   
    console.log("Feeding event contract with Link token..");

    let eventFactory = await hre.ethers.getContract("EventFactory");
    
  

    let decimal = await LinkToken.decimals();

   let transaction = await LinkToken.transfer(eventFactory.target, hre.ethers.parseUnits("5", decimal));
   await transaction.wait(1);

    console.log("Link balance of event Factory is"+  await LinkToken.balanceOf(eventFactory.target));



}

module.exports.tags = ["all", "EventFactory"];
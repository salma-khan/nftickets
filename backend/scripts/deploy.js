// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const LINK_TOKEN_ABI = require("@chainlink/contracts/abi/v0.8/LinkTokenInterface.json")


const networks = {
  arbitrum_sepolia:{
    link_token:"0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    registrar: "0x881918E24290084409DaA91979A30e6f0dB52eBe",
    signer:"0x39B6c7af8192cF173119817246C789F2de5953A0"
  }
}

async function main() {

  const EventFactory = await hre.ethers.getContractFactory('EventFactory');
  let signer = "";
  let link_token = "";
  let registrar = "";

  if(hre.network.name =="arbitrum_sepolia"){
    signer = networks[hre.network.name].signer;
    link_token = networks[hre.network.name].link_token;
    registrar = networks[hre.network.name].registrar;
    
  } else {
  const signers = await hre.ethers.getSigners();
   signer = signers[0];
   const MockLinkToken = await hre.ethers.getContractFactory('MockLinkToken');
   const MockRegistrar = await hre.ethers.getContractFactory('MockRegistrar');
   const mockLinkToken = await MockLinkToken.deploy();
   const mockregistrar = await MockRegistrar.deploy();
   link_token = mockLinkToken.target;
   registrar = mockregistrar.target;
  }

  const eventFactory = await EventFactory.deploy(link_token,
  registrar);
  await eventFactory.waitForDeployment();
  
  const linkContract = await hre.ethers.getContractAt(LINK_TOKEN_ABI,link_token);
  
  const decimalLink = await linkContract.decimals();


  let transaction = await linkContract.transfer(eventFactory.target, hre.ethers.parseUnits("5", decimalLink));
  await transaction.wait(1);

  console.log("Event factory deployed "+ eventFactory.target+" With balance "+  await linkContract.balanceOf(eventFactory.target));



}

main().catch((error) =>
 {
  console.error(error);
  process.exitCode = 1;
});

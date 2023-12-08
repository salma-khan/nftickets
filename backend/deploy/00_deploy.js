
const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helpers-hardhat-config");




module.exports = async (hre) => {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const chainId = network.config.chainId;


  if (chainId == 421614) {
    signer = deployer;
    link_token = networkConfig[chainId].link_token;
    registrar = networkConfig[chainId].registrar;
    registry = networkConfig[chainId].registry;
  } else {

    console.log("Deploy mocks...")
      await deploy("MockLinkToken", {
      from: deployer,
      args: [],
    });
   
    await deploy("MockRegistry", {
      from: deployer,
      log: true,
      args: [],

    });
    await deploy("MockRegistrar", {
      from: deployer,
      log: true,
      args: [],
    });

    console.log("Mocks are deployed.")
     registry = await hre.ethers.getContract('MockRegistry');
     link_token = await hre.ethers.getContract('MockLinkToken');
     registrar = await hre.ethers.getContract('MockRegistrar');

  };

  let args = [];
  if(chainId ==31337){
      args =[link_token.target, registrar.target, registry.target]; 
  } else {
    args=[link_token, registrar, registry];
  }

  console.log("deploy Event Facotry...")


  const EventFactory = await deploy("EventFactory", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: networkConfig[chainId].blockConfirmation,
  });

  


  if(chainId!=31337){
  try {
    await run("verify:verify", {
        address: EventFactory.address,
        constructorArguments: args,
    })
   } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
        console.log("Already verified!")
    } else {
        console.log(e)
    }
}
  }
}




module.exports.tags = ["all", "EventFactory"];

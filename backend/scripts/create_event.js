
const {ethers, network, run} = require("hardhat");
const EVENT_TICKET_ABI = require("./EventTickets.json");
const { tags, getBlok } = require("../deploy/00_deploy");
const { networkConfig } = require("../helpers-hardhat-config");


async function main() { 
    
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const eventFactory = await deployments.get("EventFactory", deployer);
  

    const eventFactoryContract =  await ethers.getContract("EventFactory", deployer);
 
  
  
    const eventName = "EventFromscript";
    const eventSymbole  = "EFS";
    const date = new Date().getTime();
    const desc = "Event running from script";
    const location= "script location";

    const categories = [["script",10, 10, 100]];
  
    console.log("create Event..")
   let tx = await  eventFactoryContract.create(eventName,eventSymbole, date,   desc, location, categories);
    await tx.wait(1);



    let events = await eventFactoryContract.queryFilter("EventCreated",
    await eventFactory.receipt.blockNumber,'latest')

  
    let addressEvent = events[0].args[0];

    EventTicketContract = await ethers.getContractAt(EVENT_TICKET_ABI, addressEvent);


    let name = await EventTicketContract.name() ;

    console.log("Event  "+ name +" is created at address "+ addressEvent);

    console.log("Event status is "+ await EventTicketContract.eventStatus());

    console.log("Activate the event....");

     await EventTicketContract.startSell() ;

    console.log("Event status is turned to " + await EventTicketContract.eventStatus()) ;


}


main().catch((error) =>
 {
  console.error(error);
  process.exitCode = 1;
});




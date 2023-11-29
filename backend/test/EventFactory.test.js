const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { keccak256,  } = require("ethers");

describe("EventFactory", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployEventFactory() {

    const eventName = "NFTTest";
    const eventSymbol = "NFTSymb";
    const dateEvent = Math.floor(new Date().getTime() / 1000);

    const [owner] = await ethers.getSigners();
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy();
    

    return { owner, eventFactory, eventName, eventSymbol, dateEvent };
  }

  describe("Deployment", function () {
    it("should be deployed", async function () {
      const { eventFactory } = await loadFixture(deployEventFactory);
      expect(eventFactory.target).not.equal(0);
    });
  });


  describe("Deploy", function () {
    it("Should emit an event", async function () {
  
      const { eventFactory, eventName, eventSymbol, dateEvent  } = await loadFixture(deployEventFactory);

      const EventTickets = await ethers.getContractFactory("EventTickets");
      
      let tx = await eventFactory.create(eventName, eventSymbol, dateEvent);
      await tx.wait();   

      const byteCode = ethers.concat([EventTickets.bytecode,  EventTickets.interface.encodeDeploy([eventName, eventSymbol,dateEvent])]);
      const address =  ethers.getCreate2Address(eventFactory.target, ethers.solidityPackedKeccak256(["string"],[eventName]), keccak256(byteCode));
    
     
      const filter = eventFactory.filters.EventCreated(); 
      const events = await eventFactory.queryFilter(filter);
     
      expect(address).equal(events[0].args[0]);
  
    });

    it("should transfer the contract to the original owner", async function () {
      const { eventFactory, eventName, eventSymbol, dateEvent, owner  } = await loadFixture(deployEventFactory);
    
      let tx = await eventFactory.create(eventName, eventSymbol, dateEvent);
      await tx.wait(); 
      const filter = eventFactory.filters.EventCreated(); 
      const events = await eventFactory.queryFilter(filter);
      const address = events[0].args[0];

      const EventTickets = await ethers.getContractFactory("EventTickets");
      const eventTickets = EventTickets.attach(address);
      expect( await eventTickets.owner()).is.equal(owner.address);
     
    });

  });
});

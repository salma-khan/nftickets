const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("EventFactory", function () {

  async function deployEventFactory() {

    const eventName = "NFTTest";
    const eventSymbol = "NFTSymb";
    const eventDec = "Desc";
    const eventLocation = "loca";
    const dateEvent = Math.floor(new Date().getTime() / 1000);

    const [owner, other] = await ethers.getSigners();
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const LinkToken = await ethers.getContractFactory("MockLinkToken");
    const Registrar = await ethers.getContractFactory("MockRegistrar");
    const Registry = await ethers.getContractFactory("MockRegistry");
    const linkToken = await LinkToken.deploy();
    const registrar = await Registrar.deploy();
    const registry = await Registry.deploy();
    const eventFactory = await EventFactory.deploy(linkToken.target, registrar.target, registry.target);


    return { owner, eventFactory, eventName, eventSymbol, dateEvent, other, eventDec, eventLocation, linkToken };
  }

  describe("Deploy", function () {
    it("should be deployed", async function () {
      const { eventFactory } = await loadFixture(deployEventFactory);
      expect(eventFactory.target).not.equal(0);
    });

    it("Should be feeded with Link", async function () {
      const { eventFactory, linkToken } = await loadFixture(deployEventFactory);
      await linkToken.transfer(eventFactory.target, 10);
      expect(await linkToken.balanceOf(eventFactory.target)).equal(10);
    });
  });


  describe("Create", function () {
    it("Should emit an event EventCreated", async function () {
      const categories = [["Gold", 10, 20, 100]];
      const { eventFactory, eventName, eventSymbol, dateEvent, owner, eventDec, eventLocation } = await loadFixture(deployEventFactory);


      let tx = await eventFactory.create(eventName, eventSymbol, dateEvent, eventDec, eventLocation,categories);
      await tx.wait();

      const filter = eventFactory.filters.EventCreated();
      const events = await eventFactory.queryFilter(filter);

      expect(events[0].eventName).to.include("EventCreated");

    });

    it("Should emit an event EventRegistered", async function () {
      const categories = [["Gold", 10, 20, 100]];

      const { eventFactory, eventName, eventSymbol, dateEvent, eventDec, eventLocation } = await loadFixture(deployEventFactory);

      let tx = await eventFactory.create(eventName, eventSymbol, dateEvent, eventDec, eventLocation, categories);
      await tx.wait();
     
      const filter = eventFactory.filters.EventRegistered();
      const events = await eventFactory.queryFilter(filter);
      expect(1).equal(events[0].args[0]);

    });


    it("Should revert if UpkeepId is 0", async function () {
      const categories = [["Gold", 10, 20, 100]];
      const { eventFactory, eventName, eventSymbol, dateEvent, eventDec, eventLocation } = await loadFixture(deployEventFactory);
      const MockRegistrarError = await ethers.getContractFactory("MockRegistrarError");
      const mockRegistrarError=  await MockRegistrarError.deploy();
      eventFactory.setRegistrar(mockRegistrarError.target);
      await expect( eventFactory.create(eventName, eventSymbol, dateEvent, eventDec, eventLocation,categories)).to.be.reverted;
      

    });

    it("Should revert there is mor than 8 categories", async function () {
   
      const { eventFactory, eventName, eventSymbol, dateEvent, eventDec, eventLocation } = await loadFixture(deployEventFactory);
      const MockRegistrarError = await ethers.getContractFactory("MockRegistrarError");
      const mockRegistrarError=  await MockRegistrarError.deploy();
      eventFactory.setRegistrar(mockRegistrarError.target);
      const categories = Array.from({ length: 9 }, () => ['cat', 10, 12, 100]);
      await expect( eventFactory.create(eventName, eventSymbol, dateEvent, eventDec, eventLocation, categories)).to.be.reverted;
      

    });


    it("should transfer the contract to the original owner", async function () {
      const categories = [["Gold", 10, 20, 100]];
      const { eventFactory, eventName, eventSymbol, dateEvent, owner ,eventDec ,eventLocation } = await loadFixture(deployEventFactory);
      let tx = await eventFactory.create(eventName, eventSymbol, dateEvent, eventDec, eventLocation,categories);
      await tx.wait();
      const filter = eventFactory.filters.EventCreated();
      const events = await eventFactory.queryFilter(filter);
      const address = events[0].args[0];
      const EventTickets = await ethers.getContractFactory("EventTickets");
      const eventTickets = EventTickets.attach(address);
      expect(await eventTickets.owner()).is.equal(owner.address);

    });

  });

  describe("setLinkAddress", function () {
    it("Should fail when it's not owner", async function(){
      const { eventFactory , other} = await loadFixture(deployEventFactory);
      await expect(eventFactory.connect(other).setLinkAddress(other.address)).to.be.reverted;

    });
    it("Should set the link address when it's owner", async function(){
      const { eventFactory , other} = await loadFixture(deployEventFactory);
      await eventFactory.setLinkAddress(other.address);
      expect(await eventFactory.link()).equals(other.address);

    });

  })
  describe("setRegistrar", function () {
    it("Should fail when it's not owner", async function(){
      const { eventFactory , other} = await loadFixture(deployEventFactory);
      await expect(eventFactory.connect(other).setRegistrar(other.address)).to.be.reverted;

    });
    it("Should set the link address when it's owner", async function(){
      const { eventFactory , other} = await loadFixture(deployEventFactory);
      await eventFactory.setRegistrar(other.address);
      expect(await eventFactory.registrar()).equals(other.address);
    });
    
  })

});

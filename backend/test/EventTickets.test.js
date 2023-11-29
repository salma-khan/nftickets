const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");



describe("EventTickets", function () {

  async function deployEventTickets() {

    const eventName = "NFTTest";
    const eventSymbol = "NFTSymb";
    const dateEvent = Math.floor(new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000) / 1000));
    const [owner, otherSigner] = await ethers.getSigners();
    const EventTickets = await ethers.getContractFactory("EventTickets");
    const eventTickets = await EventTickets.deploy(eventName, eventSymbol, dateEvent);


    return { owner, eventTickets, eventName, eventSymbol, dateEvent, otherSigner };
  }




  describe("Deployment", function () {
    it("should be deployed with right values", async function () {
      const { eventTickets, eventName, eventSymbol, dateEvent } = await loadFixture(deployEventTickets);
      expect(await eventTickets.name()).is.equal(eventName);
      expect(await eventTickets.symbol()).is.equal(eventSymbol);
      expect(await eventTickets.date()).is.equal(dateEvent);
    });
  });

  describe("Add categories", function () {
    it("should fails when sell is started", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      await eventTickets.startSell();
      await expect(eventTickets.categories([['Gold', 10, 10]])).to.be.revertedWith("sell is started");

    });

    it("Should fail when categories more than 8", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const categories = Array.from({ length: 9 }, () => ['cat', 10, 12]);
      await expect(eventTickets.categories(categories)).to.be.revertedWith("8 categories max");

    });

    it("Should fail when it not an owner", async function () {
      const { eventTickets, otherSigner } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20], ['Silver', 40, 34]];
      await expect(eventTickets.connect(otherSigner).categories(addCat)).to.be.reverted;
    });

    it("Should successfully create categories", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20], ['Silver', 40, 34]];
      await eventTickets.categories(addCat);
      let categories = await eventTickets.getCategories();
      expect(categories.length).equal(addCat.length);
      expect(categories.every((value, index) => value === addCat[index]));
    });
  });


  describe("start sell", function () {
    it("Should fail when it's not owner", async function () {
      const { eventTickets, otherSigner } = await loadFixture(deployEventTickets);
      await expect(eventTickets.connect(otherSigner).startSell()).to.be.reverted;
    });

    it("Should emit an event", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      expect(await eventTickets.startSell()).to.emit('SellingStarted');
    });

  });


  describe("buy", function () {
    it("should fail when sale is not active", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      await expect(eventTickets.buy(1, 'Gold', 'http://test.com')).to.be.revertedWith("Sale is not opened");
    });

    it("should fail when not found category", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      eventTickets.startSell();
      await expect(eventTickets.buy(1, 'Gold', 'http://test.com')).to.be.revertedWith("Category unknown");
    });

    it("should fail when buy after event", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20], ['Silver', 40, 34]];
      await eventTickets.categories(addCat);
      eventTickets.startSell();

      await network.provider.send("evm_setNextBlockTimestamp", [Math.floor(new Date(new Date().getTime() + (2 * 24 * 60 * 60 * 1000) / 1000))])
      await expect(eventTickets.buy(1, 'Gold', 'http://test.com')).to.be.revertedWith("past event");
    });

    it("Should fail when the price is less then required", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20]];
      await eventTickets.categories(addCat);
      eventTickets.startSell();
      await expect(eventTickets.buy(1, 'Gold', 'http://test.com', { value: ethers.parseUnits("9", "wei") })).to.be.revertedWith("Not enought money");
    });

    it("Should fail when the seat number is not valid", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20]];
      await eventTickets.categories(addCat);
      eventTickets.startSell();
      await expect(eventTickets.buy(21, 'Gold', 'http://test.com', { value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Invalid seatNumber");
    });

    it("Should fail when the seat number is not valid", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20]];
      await eventTickets.categories(addCat);
      eventTickets.startSell();
      await expect(eventTickets.buy(0, 'Gold', 'http://test.com', { value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Invalid seatNumber");
    });


    it("Should fail when the seat number is already taken", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20]];
      await eventTickets.categories(addCat);
      eventTickets.startSell();
      await eventTickets.buy(1, 'Gold', 'http://test.com', { value: ethers.parseUnits("10", "wei") })
      await expect(eventTickets.buy(1, 'Gold', 'http://test.com', { value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Already taken");
    });


    it("Should Get a tokenId when minted successfully", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20]];
      await eventTickets.categories(addCat);
      await eventTickets.startSell();
      const tx = await eventTickets.buy(1, 'Gold', 'http://test.com', { value: ethers.parseUnits("10", "wei") });
      await tx.wait();
      const filter = eventTickets.filters.MetadataUpdate();
      const events = await eventTickets.queryFilter(filter);
      expect(events[0].args[0]).to.be.equals(ethers.keccak256(ethers.toUtf8Bytes('Gold1')));
    });

    it("Should set the uri token", async function () {
      const { eventTickets } = await loadFixture(deployEventTickets);
      const addCat = [['Gold', 10, 20]];
      await eventTickets.categories(addCat);
      await eventTickets.startSell();
      await eventTickets.buy(1, 'Gold', 'http://test.com', { value: ethers.parseUnits("10", "wei") });
      expect( await eventTickets.tokenURI(ethers.keccak256(ethers.toUtf8Bytes('Gold1')))).to.be.equals('http://test.com');
    });


  });










});

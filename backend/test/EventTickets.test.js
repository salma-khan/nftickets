const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");



describe("EventTickets", function () {




  async function freshDeployEventTicket() {

    const EVENT_NAME = "NFTTest";
    const EVENT_SYMBOL = "NFTSymb";
    const EVENT_DATE = Math.floor(new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000) / 1000));

    const [owner, otherSigner] = await ethers.getSigners();
    const EventTickets = await ethers.getContractFactory("EventTickets");
    const eventTickets = await EventTickets.deploy(EVENT_NAME, EVENT_SYMBOL, EVENT_DATE);
    return { owner, eventTickets, EVENT_NAME, EVENT_SYMBOL, EVENT_DATE, otherSigner };

  }

  async function readyForSaleEventTickets() {

    const EVENT_NAME = "NFTTest";
    const EVENT_SYMBOL = "NFTSymb";
    const EVENT_DATE = Math.floor(new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000) / 1000));
    const CATEGORY_1_NAME = "Cat1";
    const CATEGORY_2_NAME = "Cat2";
    const categories = [[CATEGORY_1_NAME, 10, 20, 100], [CATEGORY_2_NAME, 20, 50, 150]];

    const EventTickets = await ethers.getContractFactory("EventTickets");
    const eventTickets = await EventTickets.deploy(EVENT_NAME, EVENT_SYMBOL,
      EVENT_DATE);



    await eventTickets.categories(categories);
    await eventTickets.startSell();



    return { eventTickets, CATEGORY_1_NAME, CATEGORY_2_NAME };
  }


  async function readyToPutInSecondMarket() {

    const EVENT_NAME = "NFTTest";
    const EVENT_SYMBOL = "NFTSymb";
    const EVENT_DATE = Math.floor(new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000) / 1000));
    const CATEGORY_1_NAME = "Cat1";
    const CATEGORY_2_NAME = "Cat2";
    const categories = [[CATEGORY_1_NAME, 10, 20, 100], [CATEGORY_2_NAME, 20, 50, 150]];

    const EventTickets = await ethers.getContractFactory("EventTickets");
    const eventTickets = await EventTickets.deploy(EVENT_NAME, EVENT_SYMBOL,
      EVENT_DATE);
    const [owner, firstSigner, secondSigner] = await ethers.getSigners();

    const tokenId = ethers.keccak256(ethers.toUtf8Bytes('Cat11'))

    await eventTickets.categories(categories);
    await eventTickets.startSell();
    await eventTickets.connect(firstSigner).buy(1, CATEGORY_1_NAME, "http://tes.com", { value: ethers.parseUnits("10", "wei") });


    return { firstSigner, eventTickets, secondSigner, tokenId };
  }



  describe("Deployment", function () {
    it("should be deployed with right values", async function () {
      const { eventTickets, EVENT_NAME, EVENT_SYMBOL, EVENT_DATE } = await loadFixture(freshDeployEventTicket);
      expect(await eventTickets.name()).is.equal(EVENT_NAME);
      expect(await eventTickets.symbol()).is.equal(EVENT_SYMBOL);
      expect(await eventTickets.date()).is.equal(EVENT_DATE);
      expect(await eventTickets.eventStatus()).is.equal(0);

    });
  });

  describe("Add categories", function () {

    beforeEach(async function () {
      Object.assign(this, await loadFixture(freshDeployEventTicket));
    });

    it("should fails when sell is started", async function () {
      await this.eventTickets.categories([['CAT1', 10, 10, 100]]);
      await this.eventTickets.startSell();
      await expect(this.eventTickets.categories([['CAT2', 10, 10, 100]])).to.be.revertedWith("Sale is started");

    });

    it("Should fail when categories more than 8", async function () {
      const categories = Array.from({ length: 9 }, () => ['cat', 10, 12, 100]);
      await expect(this.eventTickets.categories(categories)).to.be.revertedWith("8 categories max");

    });

    it("Should fail when it not an owner", async function () {

      const addCat = [['Gold', 10, 20, 100], ['Silver', 40, 34, 100]];
      await expect(this.eventTickets.connect(this.otherSigner).categories(addCat)).to.be.reverted;
    });

    it("Should successfully create categories", async function () {

      const addCat = [['Gold', 10, 20, 100], ['Silver', 40, 34, 100]];
      await this.eventTickets.categories(addCat);
      let categories = await this.eventTickets.getCategories();

      expect(categories.length).equal(addCat.length);
      expect(categories.every((value, index) => value === addCat[index]));
    });
  });


  describe("Start sell", function () {
    beforeEach(async function () {
      Object.assign(this, await loadFixture(freshDeployEventTicket));
    });

    it("Should fail when it's not owner", async function () {
      await expect(this.eventTickets.connect(this.otherSigner).startSell()).to.be.reverted;
    });

    it("Should fail when categories not provided", async function () {
      await expect(this.eventTickets.startSell()).to.be.revertedWith("No categories provided");
    });

    it("Should emit an event", async function () {
      await this.eventTickets.categories([['Cat', 10, 100, 200]]);
      expect(await this.eventTickets.startSell()).to.emit('SellingStarted');
    });

    it("Should change the state to SALES_OPEN", async function () {
      await this.eventTickets.categories([['Cat', 10, 100, 200]]);
      await this.eventTickets.startSell()
      expect(await this.eventTickets.eventStatus()).to.be.equal(1);
    });

  });


  describe("buy", function () {
    beforeEach(async function () {
      Object.assign(this, await loadFixture(readyForSaleEventTickets));
    });

    it("should fail when sale is not active", async function () {
      Object.assign(this, await loadFixture(freshDeployEventTicket));
      await expect(this.eventTickets.buy(1, this.CATEGORY_1_NAME, 'http://test.com')).to.be.revertedWith("Sale is not started");

    });

    it("should fail when not found category", async function () {

      await expect(this.eventTickets.buy(1, 'Gold', 'http://test.com')).to.be.revertedWith("Category unknown");
    });


    it("Should fail when the price is less then required", async function () {

      await expect(this.eventTickets.buy(1, this.CATEGORY_1_NAME, 'http://test.com', { value: ethers.parseUnits("9", "wei") })).to.be.revertedWith("Not enought money");
    });

    it("Should fail when the seat number is not valid", async function () {

      await expect(this.eventTickets.buy(21, this.CATEGORY_1_NAME, 'http://test.com', { value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Invalid seatNumber");
    });

    it("Should fail when the seat number is not valid", async function () {

      await expect(this.eventTickets.buy(0, this.CATEGORY_1_NAME, 'http://test.com', { value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Invalid seatNumber");
    });


    it("Should fail when the seat number is already taken", async function () {

      await this.eventTickets.buy(1, this.CATEGORY_1_NAME, 'http://test.com', { value: ethers.parseUnits("10", "wei") });

      await expect(this.eventTickets.buy(1, this.CATEGORY_1_NAME, 'http://test.com', { value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Already taken");
    });


    it("Should Get a tokenId when minted successfully", async function () {

      const tx = await this.eventTickets.buy(1, this.CATEGORY_1_NAME, 'http://test.com', { value: ethers.parseUnits("10", "wei") });
      await tx.wait();
      const filter = this.eventTickets.filters.MetadataUpdate();
      const events = await this.eventTickets.queryFilter(filter);
      expect(events[0].args[0]).to.be.equals(ethers.keccak256(ethers.toUtf8Bytes('Cat11')));
    });

    it("Should set the uri token", async function () {

      await this.eventTickets.buy(1, this.CATEGORY_1_NAME, 'http://test.com', { value: ethers.parseUnits("10", "wei") });
      expect(await this.eventTickets.tokenURI(ethers.keccak256(ethers.toUtf8Bytes('Cat11')))).to.be.equals('http://test.com');
    });

  });
  describe("sell", function () {
    beforeEach(async function () {
      Object.assign(this, await loadFixture(readyToPutInSecondMarket));
    });

    it("Should fail when tokenId is not owned by the sender", async function () {
      await expect(this.eventTickets.connect(this.secondSigner).sell(this.tokenId, 100)).to.be.revertedWith("Not owner.");

    });

    it("Should fail when token Id not exists", async function () {
      const tokenId = ethers.keccak256(ethers.toUtf8Bytes('Cat13'))
      await expect(this.eventTickets.connect(this.firstSigner).sell(tokenId, 100)).to.be.reverted

    });

    it("Should fail when price exceed the defined one", async function () {
      await expect(this.eventTickets.connect(this.firstSigner).sell(this.tokenId, 150)).to.be.revertedWith("Price exceed.")

    });


    it("Shoud fail when the event is over", async function () {
      await network.provider.send("evm_setNextBlockTimestamp", [Math.floor(new Date(new Date().getTime() + (2 * 24 * 60 * 60 * 1000) / 1000))])
      await expect(this.eventTickets.connect(this.firstSigner).sell(this.tokenId, 99)).to.be.revertedWith("past event")

    });

    it("Should put in second market", async function () {
      await this.eventTickets.connect(this.firstSigner).sell(this.tokenId, 100);
      let tokenForSale = await this.eventTickets.secondMarketToken(this.tokenId)
    
      expect(tokenForSale[0]).to.be.true;
      expect(tokenForSale[1]).to.be.equals(100);
  
    });
    
    it("Should emit event when it is in resale", async function () {
       expect(await this.eventTickets.connect(this.firstSigner).sell(this.tokenId, 99)).to.emit('emitInSecondMarket').withArgs(this.tokenId);
   
    });
  });

    describe("buySecondMarket", function () {
      beforeEach(async function () {
        Object.assign(this, await loadFixture(readyToPutInSecondMarket));
        this.eventTickets.connect(this.firstSigner).sell(this.tokenId, 10)
      });
  
      it("Should fail when the price of id token is less the specified one", async function () {
        await expect(this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId)).to.be.revertedWith("Not enought money.");
  
      });

      it("Should fail when the token is not for sale", async function () {
         await this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId,{ value: ethers.parseUnits("10", "wei") });
         await  expect(this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId,{ value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Token not for sale");
  
      });


      it("Should transfer the token to the buyer", async function () {
        await  this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId,{ value: ethers.parseUnits("10", "wei") });
         expect( await this.eventTickets.ownerOf(this.tokenId)).to.be.equals(this.secondSigner.address);
 
     });


     it("should transfer amount  to the buyer", async function () {
     
     // to do
   });
  });


});

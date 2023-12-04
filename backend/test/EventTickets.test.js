const {
  
  loadFixture,
helpers} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
 const {time}= require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");




describe("EventTickets", function () {




  async function freshDeployEventTicket() {

    const EVENT_NAME = "NFTTest";
    const EVENT_SYMBOL = "NFTSymb";
    const CATEGORY_1_NAME = "Cat1";
    const CATEGORY_2_NAME = "Cat2";
    const categories = [[CATEGORY_1_NAME, 10, 20, 100], [CATEGORY_2_NAME, 20, 50, 150]];
    const EVENT_DATE = Math.floor(new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000) / 1000));
    const EventTickets = await ethers.getContractFactory("EventTickets");
    const [ owner, firstSigner, secondSigner, forward, admin] = await ethers.getSigners();
    const eventTickets = await EventTickets.deploy(EVENT_NAME, EVENT_SYMBOL, EVENT_DATE, admin , categories);
    await eventTickets.connect(admin).setForwarderAddress(forward);
    return { owner, eventTickets, EVENT_NAME, EVENT_SYMBOL, EVENT_DATE, firstSigner, forward , admin, categories};

  }

  async function readyForSaleEventTickets() {

    const EVENT_NAME = "NFTTest";
    const EVENT_SYMBOL = "NFTSymb";
    const EVENT_DATE = Math.floor(new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000) / 1000));
    const CATEGORY_1_NAME = "Cat1";
    const CATEGORY_2_NAME = "Cat2";
    const categories = [[CATEGORY_1_NAME, 10, 20, 100], [CATEGORY_2_NAME, 20, 50, 150]];
    const [ owner, firstSigner, secondSigner, forward, admin] = await ethers.getSigners();

    const EventTickets = await ethers.getContractFactory("EventTickets");
    const eventTickets = await EventTickets.deploy(EVENT_NAME, EVENT_SYMBOL,
      EVENT_DATE, admin, categories);
    await eventTickets.connect(admin).setForwarderAddress(forward);
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
    const [ owner, firstSigner, secondSigner, forward, admin] = await ethers.getSigners();

    const EventTickets = await ethers.getContractFactory("EventTickets");
    const eventTickets = await EventTickets.deploy(EVENT_NAME, EVENT_SYMBOL,
      EVENT_DATE, admin,categories);
     
      await eventTickets.connect(admin).setForwarderAddress(forward);
    const tokenId = ethers.keccak256(ethers.toUtf8Bytes('Cat11'))
    await eventTickets.startSell();
    await eventTickets.connect(firstSigner).buy(1, CATEGORY_1_NAME, "http://tes.com", { value: ethers.parseUnits("10", "wei") });

    return { firstSigner, eventTickets, secondSigner, tokenId, forward };
  }



  describe("Deployment", function () {
    it("should be deployed with right values", async function () {
      const { eventTickets, EVENT_NAME, EVENT_SYMBOL, EVENT_DATE, categories } = await loadFixture(freshDeployEventTicket);
      expect(await eventTickets.name()).is.equal(EVENT_NAME);
      expect(await eventTickets.symbol()).is.equal(EVENT_SYMBOL);
      expect(await eventTickets.date()).is.equal(EVENT_DATE);
      expect(await eventTickets.eventStatus()).is.equal(0);
      const resultCat = await eventTickets.getCategories()
      expect(resultCat[0][0]).to.be.equals("Cat1");

    });
  });

 
  describe("Start sell", function () {
    beforeEach(async function () {
      Object.assign(this, await loadFixture(freshDeployEventTicket));
    });

    it("Should fail when it's not owner", async function () {
      await expect(this.eventTickets.connect(this.firstSigner).startSell()).to.be.reverted;
    });



    it("Should emit an event", async function () {
      expect(await this.eventTickets.startSell()).to.emit('SellingStarted');
    });

    it("Should change the state to SALES_OPEN", async function () {
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
      await expect(this.eventTickets.buy(1, this.CATEGORY_1_NAME, 'http://test.com')).to.be.revertedWith("Sale is not open");

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
      await this.eventTickets.connect(this.forward).performUpkeep("0x");
      await expect(this.eventTickets.connect(this.firstSigner).sell(this.tokenId, 99)).to.be.revertedWith("Sale is not open")

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
      await this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId, { value: ethers.parseUnits("10", "wei") });
      await expect(this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId, { value: ethers.parseUnits("10", "wei") })).to.be.revertedWith("Token not for sale");

    });


    it("Should transfer the token to the buyer", async function () {
      await this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId, { value: ethers.parseUnits("10", "wei") });
      expect(await this.eventTickets.ownerOf(this.tokenId)).to.be.equals(this.secondSigner.address);

    });


    it("should transfer amount to the buyer", async function () {
      const initialBalance = await ethers.provider.getBalance(this.firstSigner);
      const initialBalanceSeller = await ethers.provider.getBalance(this.firstSigner);
      await this.eventTickets.connect(this.secondSigner).buySecondMarket(this.tokenId, { value: ethers.parseEther("1") });
      expect(await ethers.provider.getBalance(this.firstSigner)).is.greaterThan(initialBalance)
      expect(await ethers.provider.getBalance(this.secondSigner)).is.lessThan(initialBalanceSeller)
    });
  });

  describe("checkUpkeep", function () {
    beforeEach(async function () {
      Object.assign(this, await loadFixture(freshDeployEventTicket));
    });

    it("Should return true when event is finished", async function(){
     const t =  Math.floor(new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000) / 1000))
    await time.increase(t);
    let result = await this.eventTickets.checkUpkeep("0x");     
    expect(result[0]).to.be.true;
       
    }
  )
  it("Should return false when event is not finished", async function(){
    let result = await this.eventTickets.checkUpkeep("0x");     
    expect(result[0]).to.be.false;
       
   });
});

describe("performUpKeep", function () {
  beforeEach(async function () {
    Object.assign(this, await loadFixture(freshDeployEventTicket));
  });

it("Should fail when it's not forward address", async function(){
   await expect(this.eventTickets.performUpkeep("0x")).to.be.revertedWith("Not valid");     
 });

 it("Should change state when performUpkeep", async function(){
  await this.eventTickets.connect(this.forward).performUpkeep("0x");
  expect(await this.eventTickets.eventStatus()).equals(2);
});



});

describe("setForwardAddress", function () {
  beforeEach(async function () {
    Object.assign(this, await loadFixture(freshDeployEventTicket));
  });

it("Should fail when it's not admin", async function(){
   await expect(this.eventTickets.setForwarderAddress(this.firstSigner)).to.be.revertedWith("Not admin");     
 });

 it("should setForward address", async function(){
  await this.eventTickets.connect(this.admin).setForwarderAddress(this.firstSigner);
  expect(await this.eventTickets.forwarder()).equals(this.firstSigner.address);
});


});

describe("setAdmin", function () {
  beforeEach(async function () {
    Object.assign(this, await loadFixture(freshDeployEventTicket));
  });

it("Should fail when it's not admin", async function(){
   await expect(this.eventTickets.setAdmin(this.firstSigner)).to.be.revertedWith("Not admin");     
 });

 it("should set the admin", async function(){
  await this.eventTickets.connect(this.admin).setAdmin(this.firstSigner);
  expect(await this.eventTickets.admin()).equals(this.firstSigner.address);
});
});

describe("widhdraw", function () {
  beforeEach(async function () {
    Object.assign(this, await loadFixture(readyToPutInSecondMarket));
  });

it("Shoud fail when it's not owner", async function(){
   await expect(this.eventTickets.connect(this.firstSigner).withdraw()).to.be.reverted;     
 });

 it("Should fail if before the event", async function(){
  await expect(this.eventTickets.withdraw()).to.be.revertedWith("Event did not occures"); 
});
it("Widhdraw after the event", async function(){
  let balance = await ethers.provider.getBalance(this.eventTickets);
  expect(balance).is.greaterThan(0);

  await this.eventTickets.connect(this.forward).performUpkeep("0x");
  await this.eventTickets.withdraw();
  let balanceAfter = await ethers.provider.getBalance(this.eventTickets);
  expect(balanceAfter).is.equal(0);


});
});

});

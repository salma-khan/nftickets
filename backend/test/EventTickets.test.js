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
      const dateEvent = new Date().setDate(new Date().getDate() +1);
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
          await expect(eventTickets.categories([['Gold',10, 10]])).to.be.revertedWith("sell is started");
       
        });

        it("Should fail when categories more than 8", async function () {
          const { eventTickets } = await loadFixture(deployEventTickets);
          const categories = Array.from({ length: 9 }, () => ['cat', 10, 12]);
          await expect(eventTickets.categories(categories)).to.be.revertedWith("8 categories maximum");
       
        });

        it("Should fail when it not an owner", async function () {
          const { eventTickets, otherSigner } = await loadFixture(deployEventTickets);
          const addCat = [['Gold',10, 20],['Silver',40,34]];
          await expect(eventTickets.connect(otherSigner).categories(addCat)).to.be.reverted;
        });

        it("Should successfully create categories", async function () {
          const { eventTickets } = await loadFixture(deployEventTickets);
          const addCat = [['Gold',10, 20],['Silver',40,34]];
          await eventTickets.categories(addCat);
          let categories = await eventTickets.getCategories();
          expect(categories.length).equal(addCat.length);
          expect(categories.every((value, index) => value === addCat[index]));
        });
      });


      describe("start sell", function () {
        it("Should fail when it's not owner", async function () {
          const { eventTickets, otherSigner } = await loadFixture(deployEventTickets);
          await expect(  eventTickets.connect(otherSigner).startSell()).to.be.reverted;
        });

        it("Should emit an event", async function () {
          const { eventTickets } = await loadFixture(deployEventTickets);
           expect(await eventTickets.startSell()).to.emit('SellingStarted');
        });

      });


        describe("buy", function () {
          it("should fail when sale is not active", async function () {
            const { eventTickets } = await loadFixture(deployEventTickets);
            await expect( eventTickets.buy(1, 'Gold', 'http://test.com')).to.be.revertedWith("Sale is not opened");
          });

          it("should fail when not found category", async function () {
            const { eventTickets } = await loadFixture(deployEventTickets);
            eventTickets.startSell();
            await expect( eventTickets.buy(1, 'Gold', 'http://test.com')).to.be.revertedWith("Category unknown");
          });

          it("should fail when buy after event", async function () {
            await time.increase( 7 * 24 * 60 * 60);
            const { eventTickets } = await loadFixture(deployEventTickets);
            eventTickets.startSell();
            await expect( eventTickets.buy(1, 'Gold', 'http://test.com')).to.be.revertedWith("Category unknown");
          });
  
      
  });

  


  


  
  
  
  });
  
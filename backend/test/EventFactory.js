const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("EventFactory", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployEventFactory() {


    const [owner] = await ethers.getSigners();
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy();

    return { owner, eventFactory };
  }

  describe("Deployment", function () {
    it("should be deployed", async function () {
      const { eventFactory } = await loadFixture(deployEventFactory);
      expect(eventFactory.target).not.equal(0);
    });
  });


  describe("Deploy", function () {
    it("should emit event", async function () {
      const NFTName = "NFTTest";
      const NFTSymbol = "NFTSymb";
      const today = Math.floor(new Date().getTime() / 1000);
      const { eventFactory } = await loadFixture(deployEventFactory);
      expect(await eventFactory.deploy(NFTName, NFTSymbol, today)).to.emit('EventCreated');
    });

  });
});

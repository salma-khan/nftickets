require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
require("@nomicfoundation/hardhat-verify")

const API_URL = process.env.API_URL || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    arbitrum_sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 421614,

    },
  
  },
  etherscan: {
    apiKey: "5JCG5XU3WUSSFJ8YE8WRS96MQXRVKFA6HR"
  },


  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
  }

  }
}
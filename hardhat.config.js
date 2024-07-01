const { version } = require("chai")

require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("@nomicfoundation/hardhat-ethers")
require("hardhat-deploy")
require("dotenv").config()
require("solhint").config()

const SEPOLIA_RPC_URL = process.env.RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

// console.log(`RPC_URL ${SEPOLIA_RPC_URL}
//     PRIVATE_KEY ${PRIVATE_KEY}
//     ETHERSCAN ${ETHERSCAN_API_KEY}
//     COINMARKETCAP ${COINMARKETCAP_API_KEY}`)

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}

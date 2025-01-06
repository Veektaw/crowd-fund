import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter"
import "solidity-coverage"
import "@typechain/hardhat"
import "hardhat-deploy" 
import * as dotenv from "dotenv";

dotenv.config();

const SEPOLIA_ALCHEMY_URL = process.env.SEPOLIA_ALCHEMY_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockGasLimit: 12000000,
      gas: "auto",
      mining: {
        auto: true,
        interval: 5000,
      },
    },
    sepolia: {
      url: SEPOLIA_ALCHEMY_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  solidity: {
    compilers: [
      {version: "0.8.19"},
      {version: "0.8.25"},
      {version: "0.8.0"},
      {version: "0.8.8"},
      {version: "0.8.15"}
    ]
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC"
  },
  namedAccounts: {  
    deployer: {
      default: 0,
    },
  },
  paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};

export default config;
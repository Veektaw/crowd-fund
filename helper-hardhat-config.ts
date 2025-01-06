interface NetworkConfigItem {
  name: string;
  ethUsdAddress: string;
}

interface NetworkConfig {
  [key: number]: NetworkConfigItem;
}

const networkConfig: NetworkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    1: {
        name: "ethereum",
        ethUsdAddress: "v"
    },
    31337: {
        name: "localhost",
        ethUsdAddress: ""
    },
    137: {
        name: "polygon",
        ethUsdAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    },
    8453: {
        name: "base",
        ethUsdAddress: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70" 
    }
}


const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

export {networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER}   
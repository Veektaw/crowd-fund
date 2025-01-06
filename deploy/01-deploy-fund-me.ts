import { network } from "hardhat";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import verify from "../utils/verify";

module.exports = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {

    console.log('Main deployment starting...')
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        console.log("Not a mock, using the assigned network...")
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdAddress;
    }

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    });

    log(`FundMe deployed at ${fundMe.address}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args);
    }
};

module.exports.tags = ["all", "fundme"];

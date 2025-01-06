import { network } from "hardhat";
import { developmentChains, DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

module.exports = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {

    console.log("Mock deployment starting...")
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks Deployed!");
        log("------------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
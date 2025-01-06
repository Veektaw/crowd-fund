import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { assert } from "chai";
import { FundMe } from "../../typechain-types";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name) ? describe.skip :
    describe("FundMe", function () {
        let fundMe: FundMe;
        let deployer: string;
        const sendValue = ethers.parseEther("0.1"); // Reduced from 1 ETH to 0.1 ETH

        beforeEach(async function () {
            // Get the deployer address
            deployer = (await getNamedAccounts()).deployer;
            
            // Get the deployed contract instance
            const fundMeDeployment = await deployments.get("FundMe");
            fundMe = await ethers.getContractAt(
                "FundMe",
                fundMeDeployment.address
            ) as FundMe;
        });

        it("Allows people to fund and withdraw", async function () {
            console.log("Funding contract...");
            await fundMe.fund({ value: sendValue });
            
            console.log("Withdrawing...");
            await fundMe.withdraw();
            
            const endingBalance = await ethers.provider.getBalance(await fundMe.getAddress());
            assert.equal(endingBalance.toString(), "0");
        });
    });

    
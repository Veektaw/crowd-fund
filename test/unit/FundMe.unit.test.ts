import { deployments, ethers, network } from "hardhat";
import { assert, expect } from "chai";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { developmentChains } from "../../helper-hardhat-config";

!developmentChains.includes(network.name) ? describe.skip :
    describe("FundMe", function () {
        let fundMe: FundMe;
        let mockV3Aggregator: MockV3Aggregator;
        let deployer: SignerWithAddress;
        const sendValue = ethers.parseEther("1");

        beforeEach(async function () {
            const accounts = await ethers.getSigners();
            deployer = accounts[0];
            
            await deployments.fixture(["all"]);
            
            const fundMeDeployment = await deployments.get("FundMe");
            const mockV3AggregatorDeployment = await deployments.get("MockV3Aggregator");
            
            fundMe = await ethers.getContractAt(
                "FundMe",
                fundMeDeployment.address,
                deployer
            ) as FundMe;

            mockV3Aggregator = await ethers.getContractAt(
                "MockV3Aggregator",
                mockV3AggregatorDeployment.address,
                deployer
            ) as MockV3Aggregator;
        });

        describe("constructor", function () {
            it("sets the aggregator addresses correctly", async function () {
                const response = await fundMe.getPricefeed();
                assert.equal(response, await mockV3Aggregator.getAddress());
            });
        });

        describe("fund", function () {
            it("Fails if you don't send enough ETH", async function () {
                await expect(
                    fundMe.fund({ value: 0 })
                ).to.be.revertedWith("Not enough ETH");
            });

            it("Updates the amount funded data structure", async function () {
                await fundMe.fund({ value: sendValue });
                const response = await fundMe.getAmountAddresss(await deployer.getAddress());
                assert.equal(response.toString(), sendValue.toString());
            });

            it("Adds funder to array of funders", async function () {
                await fundMe.fund({ value: sendValue });
                const funder = await fundMe.getFunder(0);
                assert.equal(funder, await deployer.getAddress());
            });
        });

        describe("withdraw", function () {
            beforeEach(async function() {
                await fundMe.fund({ value: sendValue });
            });

            it("Withdraw ETH from a single founder", async function() {
                // Get starting balances
                const startingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const startingDeployerBalance = await ethers.provider.getBalance(
                    await deployer.getAddress()
                );

                // Withdraw funds
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);

                if (!transactionReceipt) {
                    throw new Error("Transaction failed");
                }

                // Calculate gas cost
                const gasCost = transactionReceipt.gasUsed * transactionReceipt.gasPrice;

                // Get ending balances
                const endingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const endingDeployerBalance = await ethers.provider.getBalance(
                    await deployer.getAddress()
                );

                // Assert
                assert.equal(endingFundMeBalance.toString(), "0");
                assert.equal(
                    (startingFundMeBalance + startingDeployerBalance).toString(),
                    (endingDeployerBalance + gasCost).toString()
                );
            });

            it("Withdraw ETH from a single founder, cheaper way", async function() {
                // Get starting balances
                const startingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const startingDeployerBalance = await ethers.provider.getBalance(
                    await deployer.getAddress()
                );

                // Withdraw funds
                const transactionResponse = await fundMe.cheaperWithdraw();
                const transactionReceipt = await transactionResponse.wait(1);

                if (!transactionReceipt) {
                    throw new Error("Transaction failed");
                }

                // Calculate gas cost
                const gasCost = transactionReceipt.gasUsed * transactionReceipt.gasPrice;

                // Get ending balances
                const endingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const endingDeployerBalance = await ethers.provider.getBalance(
                    await deployer.getAddress()
                );

                // Assert
                assert.equal(endingFundMeBalance.toString(), "0");
                assert.equal(
                    (startingFundMeBalance + startingDeployerBalance).toString(),
                    (endingDeployerBalance + gasCost).toString()
                );
            });

            it("Only allows the owner to withdraw", async function () {
                const accounts = await ethers.getSigners()
                const fundMeConnectedContract = await fundMe.connect(accounts[1])
                await expect(
                    fundMeConnectedContract.withdraw()
                ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
            });
        });
    });
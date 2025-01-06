import { ethers, getNamedAccounts } from "hardhat";

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContractAt("FundMe", deployer);
    console.log("Funding contract for withdrawal...");
    const transactionResponse = await fundMe.cheaperWithdraw();
    await transactionResponse.wait(1);
    console.log("Withdrawn!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
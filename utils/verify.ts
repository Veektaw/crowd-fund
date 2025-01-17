import { run } from "hardhat";

async function verify(contractAddress: string, args: any[]) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified");
        } else {
            console.log(e);
        }
    }
}

export default verify;
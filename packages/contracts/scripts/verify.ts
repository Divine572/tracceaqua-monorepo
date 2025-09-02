import { run } from "hardhat";

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!contractAddress) {
        throw new Error("Please set CONTRACT_ADDRESS environment variable");
    }

    console.log("🔍 Verifying contract on Etherscan...");
    console.log("📍 Contract address:", contractAddress);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // TracceAqua constructor has no arguments
        });

        console.log("✅ Contract verified successfully!");

    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("ℹ️ Contract is already verified!");
        } else {
            console.error("❌ Verification failed:");
            console.error(error);
            throw error;
        }
    }
}

main()
    .then(() => {
        console.log("🎉 Verification completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


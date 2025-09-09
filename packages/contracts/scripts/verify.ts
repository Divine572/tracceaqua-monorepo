import { run } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
    console.log("🔍 Starting contract verification on Etherscan...");

    try {
        // Read deployment info
        const deploymentPath = join(__dirname, "../deployments/sepolia.json");
        const deploymentInfo = JSON.parse(readFileSync(deploymentPath, 'utf8'));

        console.log("📋 Contract address:", deploymentInfo.address);
        console.log("📋 Network:", deploymentInfo.network);

        // Verify the contract
        console.log("⏳ Verifying contract...");

        await run("verify:verify", {
            address: deploymentInfo.address,
            constructorArguments: deploymentInfo.constructorArgs || [],
            network: deploymentInfo.network
        });

        console.log("✅ Contract verified successfully!");
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${deploymentInfo.address}#code`);

    } catch (error) {
        if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string" && (error as any).message.includes("Already Verified")) {
            console.log("✅ Contract is already verified!");
        } else {
            console.error("❌ Verification failed:", error);
            throw error;
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    });


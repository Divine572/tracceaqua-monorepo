import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying TracceAqua contracts to network...");

    // Get the contract factory
    const TracceAqua = await ethers.getContractFactory("TracceAqua");

    console.log("📄 Deploying TracceAqua contract...");

    // Deploy the contract
    const tracceAqua = await TracceAqua.deploy();
    await tracceAqua.waitForDeployment();

    const contractAddress = await tracceAqua.getAddress();

    console.log("✅ TracceAqua deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
    
    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const totalConservationRecords = await tracceAqua.getTotalConservationRecords();
    const totalSupplyChainRecords = await tracceAqua.getTotalSupplyChainRecords();
    
    console.log("📋 Total conservation records:", totalConservationRecords.toString());
    console.log("📦 Total supply chain records:", totalSupplyChainRecords.toString());

    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployed by:", deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    console.log("\n📝 Contract interaction examples:");
    console.log("- View contract on Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("- Add to frontend env:", `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);

    return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then((address) => {
        console.log("\n🎉 Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });


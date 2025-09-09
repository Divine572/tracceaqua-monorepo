import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface DeploymentInfo {
    address: string;
    deployer: string;
    deployedAt: string;
    network: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    contractName: string;
    constructorArgs: any[];
}

async function main() {
    console.log("🚀 Starting TracceAqua deployment to Sepolia testnet...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    if (balance < ethers.parseEther("0.01")) {
        console.warn("⚠️  Warning: Low balance. You might not have enough ETH for deployment.");
    }

    // Get the ContractFactory
    console.log("📋 Getting TracceAqua contract factory...");
    const TracceAqua = await ethers.getContractFactory("TracceAqua");

    // Estimate deployment gas
    console.log("⛽ Estimating deployment gas...");
    const deploymentData = TracceAqua.interface.encodeDeploy([]);

    let estimatedGas: bigint;
    try {
        estimatedGas = await ethers.provider.estimateGas({
            data: deploymentData,
            from: deployer.address
        });
    } catch (error) {
        console.log("⚠️  Gas estimation failed, using conservative estimate");
        estimatedGas = ethers.parseUnits("500000", "wei"); // 500k gas as fallback
    }

    // Use a minimum of 5,000,000 gas for very complex contracts
    const minGas = 5000000n;
    const finalGasLimit = estimatedGas > minGas ? estimatedGas : minGas;

    console.log("📊 Estimated gas:", estimatedGas.toString());
    console.log("📊 Final gas limit:", finalGasLimit.toString());

    // Get current gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("💸 Current gas price:", ethers.formatUnits(feeData.gasPrice || 0, 'gwei'), "gwei");

    // Deploy the contract
    console.log("🔨 Deploying TracceAqua contract...");
    const tracceAqua = await TracceAqua.deploy({
        gasLimit: Math.floor(Number(finalGasLimit) * 2), // 100% buffer for safety
    });

    // Wait for deployment
    console.log("⏳ Waiting for deployment transaction to be mined...");
    await tracceAqua.waitForDeployment();

    const contractAddress = await tracceAqua.getAddress();
    const deploymentTransaction = tracceAqua.deploymentTransaction();

    console.log("✅ TracceAqua deployed to:", contractAddress);
    console.log("📄 Transaction hash:", deploymentTransaction?.hash);

    // Get deployment receipt
    const receipt = await deploymentTransaction?.wait();
    console.log("🧾 Gas used:", receipt?.gasUsed.toString());
    console.log("📦 Block number:", receipt?.blockNumber);

    // Create deployment info
    const deploymentInfo: DeploymentInfo = {
        address: contractAddress,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        network: "sepolia",
        transactionHash: deploymentTransaction?.hash || "",
        blockNumber: receipt?.blockNumber || 0,
        gasUsed: receipt?.gasUsed.toString() || "0",
        contractName: "TracceAqua",
        constructorArgs: []
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = join(__dirname, "../deployments");
    try {
        mkdirSync(deploymentsDir, { recursive: true });
    } catch (error) {
        // Directory might already exist
    }

    // Write deployment info to file
    const deploymentPath = join(deploymentsDir, "sepolia.json");
    writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentPath);

    // Set up initial roles and permissions
    console.log("🔐 Setting up initial roles and permissions...");

    try {
        // Grant all roles to deployer for testing purposes
        const roles = [
            "RESEARCHER_ROLE",
            "FARMER_ROLE",
            "FISHERMAN_ROLE",
            "PROCESSOR_ROLE",
            "TRADER_ROLE",
            "RETAILER_ROLE"
        ];

        for (const roleName of roles) {
            const roleHash = ethers.keccak256(ethers.toUtf8Bytes(roleName));
            console.log(`🎭 Granting ${roleName} to deployer...`);

            const tx = await tracceAqua.grantUserRole(deployer.address, roleHash);
            await tx.wait();
            console.log(`✅ ${roleName} granted successfully`);
        }

        // Verify deployer
        console.log("✅ Verifying deployer as trusted user...");
        const verifyTx = await tracceAqua.verifyUser(deployer.address);
        await verifyTx.wait();
        console.log("✅ Deployer verified successfully");

    } catch (error) {
        console.error("❌ Error setting up roles:", error);
    }

    // Test basic functionality
    console.log("🧪 Testing basic contract functionality...");

    try {
        // Test getting record counts
        const [conservationCount, supplyChainCount] = await tracceAqua.getRecordCounts();
        console.log("📊 Initial conservation records:", conservationCount.toString());
        console.log("📊 Initial supply chain records:", supplyChainCount.toString());

        // Test contract info
        const [version, deployedAt] = await tracceAqua.getContractInfo();
        console.log("ℹ️  Contract version:", version);
        console.log("🕒 Deployed at timestamp:", deployedAt.toString());

        // Test user verification
        const isVerified = await tracceAqua.isUserVerified(deployer.address);
        console.log("✅ Deployer verification status:", isVerified);

    } catch (error) {
        console.error("❌ Error testing functionality:", error);
    }

    // Generate environment variables for backend
    console.log("📝 Generating environment variables...");
    const envVars = [
        `# TracceAqua Smart Contract Configuration`,
        `# Generated on ${new Date().toISOString()}`,
        ``,
        `CONTRACT_ADDRESS="${contractAddress}"`,
        `DEPLOYMENT_BLOCK=${receipt?.blockNumber || 0}`,
        `DEPLOYMENT_TRANSACTION="${deploymentTransaction?.hash}"`,
        `SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"`,
        ``,
        `# For frontend (.env.local)`,
        `NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`,
        `NEXT_PUBLIC_SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"`,
        `NEXT_PUBLIC_CHAIN_ID=11155111`,
        ``
    ].join('\n');

    const envPath = join(deploymentsDir, "contract.env");
    writeFileSync(envPath, envVars);
    console.log("🔧 Environment variables saved to:", envPath);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Update your backend .env file with the CONTRACT_ADDRESS");
    console.log("2. Update your frontend .env.local file with NEXT_PUBLIC_CONTRACT_ADDRESS");
    console.log("3. Run the verification script to verify the contract on Etherscan");
    console.log("4. Test the integration with your backend services");

    console.log("\n🔗 Useful links:");
    console.log(`📄 Contract on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`📄 Deployment transaction: https://sepolia.etherscan.io/tx/${deploymentTransaction?.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });

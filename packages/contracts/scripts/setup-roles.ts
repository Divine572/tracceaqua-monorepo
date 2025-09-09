import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

interface RoleSetup {
    address: string;
    roles: string[];
    description: string;
}

async function main() {
    console.log("🎭 Setting up additional roles and permissions...");

    // Read deployment info
    const deploymentPath = join(__dirname, "../deployments/sepolia.json");
    const deploymentInfo = JSON.parse(readFileSync(deploymentPath, 'utf8'));

    // Get contract instance
    const TracceAqua = await ethers.getContractFactory("TracceAqua");
    const tracceAqua = TracceAqua.attach(deploymentInfo.address);

    console.log("📋 Contract address:", deploymentInfo.address);

    // Define test users and their roles (you can modify these addresses)
    const testUsers: RoleSetup[] = [
        {
            address: "0x742d35Cc6635C0532925a3b8D9C9E1F75d4b4986", // Example researcher
            roles: ["RESEARCHER_ROLE"],
            description: "Test Researcher"
        },
        {
            address: "0x8464135c8F25Da09e49BC8782676a84730C318bC", // Example farmer
            roles: ["FARMER_ROLE"],
            description: "Test Farmer"
        },
        {
            address: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2", // Example processor
            roles: ["PROCESSOR_ROLE"],
            description: "Test Processor"
        }
    ];

    // Grant roles to test users
    for (const user of testUsers) {
        console.log(`\n👤 Setting up ${user.description} (${user.address}):`);

        for (const roleName of user.roles) {
            try {
                const roleHash = ethers.keccak256(ethers.toUtf8Bytes(roleName));

                // Check if user already has the role
                const hasRole = await tracceAqua.hasRole(roleHash, user.address);

                if (hasRole) {
                    console.log(`✅ ${roleName} already granted`);
                } else {
                    console.log(`🔄 Granting ${roleName}...`);
                    const tx = await tracceAqua.grantUserRole(user.address, roleHash);
                    await tx.wait();
                    console.log(`✅ ${roleName} granted successfully`);
                }

                // Verify the user
                const isVerified = await tracceAqua.isUserVerified(user.address);
                if (!isVerified) {
                    console.log(`🔄 Verifying user...`);
                    const verifyTx = await tracceAqua.verifyUser(user.address);
                    await verifyTx.wait();
                    console.log(`✅ User verified`);
                } else {
                    console.log(`✅ User already verified`);
                }

            } catch (error) {
                console.error(`❌ Error setting up ${roleName} for ${user.description}:`, error);
            }
        }
    }

    console.log("\n📊 Current contract statistics:");

    try {
        const [conservationCount, supplyChainCount] = await tracceAqua.getRecordCounts();
        console.log("📈 Conservation records:", conservationCount.toString());
        console.log("📈 Supply chain records:", supplyChainCount.toString());

        const [version, deployedAt] = await tracceAqua.getContractInfo();
        console.log("ℹ️  Contract version:", version);
        console.log("🕒 Deployed at:", new Date(Number(deployedAt) * 1000).toISOString());

    } catch (error) {
        console.error("❌ Error getting contract stats:", error);
    }

    console.log("\n✅ Role setup completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Role setup failed:", error);
      process.exit(1);
  });


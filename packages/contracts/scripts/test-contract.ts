import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🧪 Testing TracceAqua contract functionality...");

  // Read deployment info
  const deploymentPath = join(__dirname, "../deployments/sepolia.json");
  const deploymentInfo = JSON.parse(readFileSync(deploymentPath, 'utf8'));
  
  // Get contract instance
  const TracceAqua = await ethers.getContractFactory("TracceAqua");
  const tracceAqua = TracceAqua.attach(deploymentInfo.address);
  
  const [signer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", signer.address);

  try {
    // Test 1: Create a conservation record
    console.log("\n📋 Test 1: Creating conservation record...");
    const samplingId = `TEST-SAMPLE-${Date.now()}`;
    const dataHash = "QmTestHash123456789"; // Example IPFS hash
    const ipfsHash = "QmTestExtended987654321";
    
    const createTx = await tracceAqua.createConservationRecord(samplingId, dataHash, ipfsHash);
    await createTx.wait();
    console.log("✅ Conservation record created with sampling ID:", samplingId);

    // Verify the record
    const conservationRecord = await tracceAqua.getConservationRecord(samplingId);
    console.log("📄 Record details:");
    console.log("  - ID:", conservationRecord.id.toString());
    console.log("  - Researcher:", conservationRecord.researcher);
    console.log("  - Data Hash:", conservationRecord.dataHash);
    console.log("  - Status:", conservationRecord.status);
    console.log("  - Verified:", conservationRecord.verified);

    // Test 2: Create a supply chain record
    console.log("\n🔗 Test 2: Creating supply chain record...");
    const productId = `TEST-PROD-${Date.now()}`;
    const productDataHash = "QmProductHash123456789";
    const initialStage = "HATCHERY";
    const sourceType = "FARMED";
    const isPublic = true;
    
    const createProdTx = await tracceAqua.createSupplyChainRecord(
      productId, 
      productDataHash, 
      initialStage, 
      sourceType, 
      isPublic
    );
    await createProdTx.wait();
    console.log("✅ Supply chain record created with product ID:", productId);

    // Verify the supply chain record
    const supplyChainRecord = await tracceAqua.getSupplyChainRecord(productId);
    console.log("📄 Product details:");
    console.log("  - ID:", supplyChainRecord.id.toString());
    console.log("  - Creator:", supplyChainRecord.creator);
    console.log("  - Current Stage:", supplyChainRecord.currentStage);
    console.log("  - Source Type:", supplyChainRecord.sourceType);
    console.log("  - Public:", supplyChainRecord.isPublic);
    console.log("  - Stage Count:", supplyChainRecord.stageCount.toString());

    // Test 3: Update supply chain stage
    console.log("\n🔄 Test 3: Updating supply chain stage...");
    const newStage = "GROW_OUT";
    const location = "Test Farm Location";
    const notes = "Moving to grow-out phase";
    const fileHashes = ["QmFile1", "QmFile2"];
    
    const updateTx = await tracceAqua.updateSupplyChainStage(
      productId, 
      newStage, 
      "QmNewStageHash", 
      location, 
      notes, 
      fileHashes
    );
    await updateTx.wait();
    console.log("✅ Supply chain stage updated to:", newStage);

    // Get stage history
    const stageHistory = await tracceAqua.getAllStageHistory(productId);
    console.log("📋 Stage history:");
    for (let i = 0; i < stageHistory.length; i++) {
      const stage = stageHistory[i];
      console.log(`  Stage ${i + 1}:`);
      console.log(`    - Stage: ${stage.stage}`);
      console.log(`    - Updated by: ${stage.updatedBy}`);
      console.log(`    - Location: ${stage.location}`);
      console.log(`    - Notes: ${stage.notes}`);
      console.log(`    - Timestamp: ${new Date(Number(stage.timestamp) * 1000).toISOString()}`);
    }

    // Test 4: Get record counts
    console.log("\n📊 Test 4: Getting record counts...");
    const [conservationCount, supplyChainCount] = await tracceAqua.getRecordCounts();
    console.log("📈 Total conservation records:", conservationCount.toString());
    console.log("📈 Total supply chain records:", supplyChainCount.toString());

    // Test 5: User record count
    const userRecordCount = await tracceAqua.getUserRecordCount(signer.address);
    console.log("👤 User record count:", userRecordCount.toString());

    // Test 6: Contract info
    console.log("\n ℹ️ Test 5: Contract information...");
    const [version, deployedAt] = await tracceAqua.getContractInfo();
    console.log("📝 Contract version:", version);
    console.log("🕒 Deployed at:", new Date(Number(deployedAt) * 1000).toISOString());

    console.log("\n🎉 All tests passed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });


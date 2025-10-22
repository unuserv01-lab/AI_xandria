const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Somnia Testnet...");
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  
  // Deploy SomniaPersonaNFT
  const SomniaPersonaNFT = await ethers.getContractFactory("SomniaPersonaNFT");
  console.log("📦 Deploying SomniaPersonaNFT...");
  
  const personaNFT = await SomniaPersonaNFT.deploy();
  await personaNFT.waitForDeployment();
  
  const personaAddress = await personaNFT.getAddress();
  console.log(`✅ SomniaPersonaNFT deployed to: ${personaAddress}`);
  
  // Save contract addresses to file
  const contractsDir = path.join(__dirname, "..", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  const contractAddresses = {
    SomniaPersonaNFT: personaAddress,
    network: "Somnia Testnet",
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(contractsDir, "deployed-addresses.json"),
    JSON.stringify(contractAddresses, null, 2)
  );
  
  // Save ABI
  const artifact = await artifacts.readArtifact("SomniaPersonaNFT");
  fs.writeFileSync(
    path.join(contractsDir, "SomniaPersonaNFT.json"),
    JSON.stringify(artifact, null, 2)
  );
  
  console.log("📄 Contract ABI and addresses saved!");
  console.log("🎉 Deployment completed successfully!");
  
  // Verification info
  console.log("\n🔍 Verification commands:");
  console.log(`npx hardhat verify --network somnia ${personaAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

// scripts/deployLandRegistration1155.js
// Usage:
// npx hardhat run scripts/deployLandRegistration1155.js           (local node)
// npx hardhat run scripts/deployLandRegistration1155.js --network sepolia

const hre = require("hardhat");

async function main() {
  /* ────────────────────────── 1. deployer only ────────────────────────── */
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployer (admin):", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  /* ───────────────────────── 2. deployment ──────────────────────── */
  const Land1155 = await hre.ethers.getContractFactory("LandRegistration1155");

  console.log("\n📦 Deploying LandRegistration1155 contract...");

  // Pass a default metadata URI for ERC-1155
  const land = await Land1155.deploy("ipfs://metadata/{id}.json");
  await land.waitForDeployment();

  const contractAddress = await land.getAddress();
  console.log("✅ LandRegistration1155 deployed to:", contractAddress);

  // Save address to file
  const fs = require("fs");
  fs.writeFileSync("deployment_address.txt", contractAddress);

  /* ─────────────── 3. Contract verification ─────────────── */
  console.log("\n🔍 Contract Configuration:");

  // Display fraud threshold
  const fraudThreshold = await land.FRAUD_THRESHOLD();
  console.log("   • Volume Fraud Threshold:", fraudThreshold.toString(), "transactions");

  // Verify admin role
  const [adminIsBuyer, adminIsSeller, adminIsAdmin] = await land.getUserRoles(deployer.address);
  console.log("   • Admin roles: Buyer=" + adminIsBuyer + ", Seller=" + adminIsSeller + ", Admin=" + adminIsAdmin);

  /* ─────────────── 4. NEW: Test Public Marketplace Functions ─────────────── */
  console.log("\n🏪 Testing Public Marketplace Functions:");

  try {
    // Test getting total properties (should be 0 initially)
    const totalProperties = await land.getTotalProperties();
    console.log("   • Total Properties Initially:", totalProperties.toString());

    // Test getting all property IDs (should be empty array)
    const allPropertyIds = await land.getAllPropertyIds();
    console.log("   • All Property IDs:", allPropertyIds.length > 0 ? allPropertyIds.map(id => id.toString()) : "[]");

    // Test getting properties for sale (should be empty array)
    const propertiesForSale = await land.getPropertiesForSale();
    console.log("   • Properties For Sale:", propertiesForSale.length > 0 ? propertiesForSale.map(id => id.toString()) : "[]");

    console.log("   ✅ Public marketplace functions working correctly");

    // Test accessing marketplace details for non-existent property (should fail gracefully)
    try {
      await land.getMarketplaceDetails(999);
      console.log("   ❌ Should have failed for non-existent property");
    } catch (error) {
      console.log("   ✅ Correctly handles non-existent property queries");
    }

  } catch (error) {
    console.log("   ⚠️ Public marketplace function test failed:", error.message);
  }

  /* ─────────────── 5. Auto-role system info ─────────────── */
  console.log("\n🤖 Auto-Role System Ready:");
  console.log("   • Users will automatically receive BUYER + SELLER roles");
  console.log("   • Triggered on first contract interaction");
  console.log("   • No admin approval needed");
  console.log("   • Admin can only perform regulatory functions");

  /* ─────────────── 6. Setup event listeners (for monitoring) ─────────────── */
  console.log("\n👂 Setting up event listeners for monitoring...");

  // Listen for auto-role grants
  land.on("AutoRolesGranted", (user, event) => {
    console.log(`🎭 AUTO-ROLES GRANTED: User ${user} at block ${event.blockNumber}`);
  });

  // Listen for suspicious activity
  land.on("SuspiciousActivity", (buyer, seller, count, landId, event) => {
    console.log(`🚨 SUSPICIOUS ACTIVITY: ${buyer} ↔ ${seller} (${count} transactions)`);
  });

  // Listen for flagged pairs
  land.on("PairFlagged", (buyer, seller, totalTransactions, event) => {
    console.log(`🚩 PAIR FLAGGED: ${buyer} ↔ ${seller} (${totalTransactions} total transactions)`);
  });

  // NEW: Listen for property registration
  land.on("LandRegistered", (landId, owner, event) => {
    console.log(`🏠 PROPERTY REGISTERED: Land ID ${landId} by ${owner} at block ${event.blockNumber}`);
  });

  // NEW: Listen for property listings
  land.on("WholeListed", (landId, priceWei, event) => {
    const priceEth = hre.ethers.formatEther(priceWei);
    console.log(`🏷️ PROPERTY LISTED: Land ID ${landId} for ${priceEth} ETH at block ${event.blockNumber}`);
  });

  console.log("✅ Event listeners active for real-time monitoring!");

  /* ────────────── 7. Demo transactions (only for local testing) ──────────── */
  if (process.env.DEMO_TRANSACTIONS === "true" && hre.network.name === "hardhat") {
    console.log("\n🧪 Running demo transactions (local network only)...");

    try {
      // Test admin requesting auto-roles (should fail)
      try {
        await land.connect(deployer).requestAutoRoles();
        console.log("   ❌ Admin auto-role request should have failed");
      } catch (error) {
        console.log("   ✅ Admin correctly prevented from getting auto-roles");
      }

      console.log("   • Demo transactions require multiple test accounts");
      console.log("   • Use local Hardhat network for full testing");

    } catch (error) {
      console.log("   ⚠️ Demo transactions skipped:", error.message);
    }
  }

  /* ────────────── 8. Deployment summary ──────────── */
  console.log("\n🎯 Deployment Summary:");
  console.log("   📝 Contract Address:", contractAddress);
  console.log("   🌐 Network:", hre.network.name);
  console.log("   👤 Admin Address:", deployer.address);

  console.log("\n🛡️ Contract Features:");
  console.log("   • Land registration & trading ✓");
  console.log("   • Fractional ownership ✓");
  console.log("   • Fully automated role granting ✓");
  console.log("   • Volume-based fraud detection ✓");
  console.log("   • Transaction monitoring ✓");
  console.log("   • Admin regulatory oversight ✓");
  console.log("   • PUBLIC marketplace browsing ✓ (NEW)");

  console.log("\n🏪 NEW: Public Marketplace Features:");
  console.log("   • Anyone can browse properties without wallet connection");
  console.log("   • Public access to property details and pricing");
  console.log("   • Filter properties for sale vs all properties");
  console.log("   • Better UX - browse first, then connect to buy");

  console.log("\n📋 Role Structure:");
  console.log("   • Admin (you): Fraud detection & emergency controls only");
  console.log("   • Regular Users: Auto-granted BUYER + SELLER roles on first interaction");
  console.log("   • Zero waiting time - immediate platform access");
  console.log("   • Fully decentralized user onboarding");

  if (hre.network.name === "sepolia") {
    console.log("\n🌐 Sepolia Testnet Deployment:");
    console.log("   • View on Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("   • Use this address in your frontend");
    console.log("   • Users can now interact with the contract");
    console.log("   • Public marketplace functions ready for frontend integration");
  }

  console.log("\n🚀 Ready for users!");
  console.log("   • Contract is live and functional");
  console.log("   • Users get instant access upon first interaction");
  console.log("   • No admin intervention required for user onboarding");
  console.log("   • Public browsing enabled for better UX");

  /* ────────────── 9. Frontend Integration Guide ──────────── */
  console.log("\n📱 Frontend Integration Notes:");
  console.log("   • Use getMarketplaceDetails(id) for public property browsing");
  console.log("   • Use getAllPropertyIds() to list all properties");
  console.log("   • Use getPropertiesForSale() to filter available properties");
  console.log("   • Use getTotalProperties() for pagination and stats");
  console.log("   • Connect wallet only when user wants to buy/sell");

  // Keep the process alive for a short time to catch initial events
  if (hre.network.name !== "hardhat") {
    console.log("\n⏳ Monitoring for 30 seconds for any immediate activity...");
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

/* ────────────────────────── run script ─────────────────────────── */
main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Deployment failed:");
    console.error(err);
    process.exit(1);
  });

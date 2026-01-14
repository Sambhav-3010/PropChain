const hre = require("hardhat");

async function main() {
    const address = "0x73C51E918887C0322eAe44E12075827804A4cC6c";
    console.log("Checking address:", address);
    console.log("Network:", hre.network.name);

    try {
        const code = await hre.ethers.provider.getCode(address);
        console.log("Code length:", code.length);
        if (code === "0x") {
            console.log("❌ No code at this address on this network!");
        } else {
            console.log("✅ Code found at this address.");
        }
    } catch (error) {
        console.error("Error fetching code:", error);
    }
}

main().catch(console.error);

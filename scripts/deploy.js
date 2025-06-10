const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const SupetUniqueToken = await hre.ethers.getContractFactory("SupetUniqueToken");

  const price = hre.ethers.parseEther("0.01");  
  const maxSupply = 1000;

  const supetUniqueToken = await SupetUniqueToken.deploy(deployer.address, price, maxSupply);

  console.log("Contract deployed to:", supetUniqueToken.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

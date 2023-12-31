import { ethers } from 'hardhat';
async function main() {
  const NameHashFactory = await ethers.getContractFactory('NameHash');
  const nameHash = await NameHashFactory.deploy();
  console.log(`Deployed Name Hash to ${nameHash.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

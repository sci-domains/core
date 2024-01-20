import { ethers, upgrades } from 'hardhat';

const SCI_ADDRESS = '0xB015ac4d088B8693f18e16b820937875FB5703f6';

async function main() {
  const SCIFactory = await ethers.getContractFactory('SCI');
  await upgrades.upgradeProxy(SCI_ADDRESS, SCIFactory);
  console.log(`SCI Upgrade`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

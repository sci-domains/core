import { ethers, upgrades } from 'hardhat';

const SCI_ADDRESS = '0x2e5dc9078562F3De22e5A5D1A74dD79048C8bD5d';

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

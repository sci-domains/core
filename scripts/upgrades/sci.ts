import { ethers, upgrades } from 'hardhat';
import { CONTRACT_NAMES, getDeployedContractAddress } from '../utils';

async function main() {
  const SCIFactory = await ethers.getContractFactory('SCI');
  await upgrades.upgradeProxy(await getDeployedContractAddress(CONTRACT_NAMES.SCI), SCIFactory);
  console.log(`SCI Upgrade`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

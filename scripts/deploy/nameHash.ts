import { ethers } from 'hardhat';
import { CONTRACT_NAMES, logDeployment, saveDeployment } from './utils';

async function main() {
  const NameHashFactory = await ethers.getContractFactory(CONTRACT_NAMES.NAME_HASH);
  const nameHash = await NameHashFactory.deploy();

  await saveDeployment(nameHash, CONTRACT_NAMES.NAME_HASH);
  await logDeployment(nameHash, CONTRACT_NAMES.NAME_HASH, []);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

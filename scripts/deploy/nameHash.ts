import { ethers } from 'hardhat';
import { logDeployment, saveDeployment } from './utils';

const CONTRACT_NAME = 'NameHash';
async function main() {
  const NameHashFactory = await ethers.getContractFactory(CONTRACT_NAME);
  const nameHash = await NameHashFactory.deploy();

  await saveDeployment(nameHash, CONTRACT_NAME);
  await logDeployment(nameHash, CONTRACT_NAME, []);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

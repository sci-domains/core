import { ethers } from 'hardhat';
import { logDeployment, saveDeployment } from './utils';

const CONTRACT_NAME = 'SCIAuthorizer';

async function main() {
  const SCIAuthorizerFactory = await ethers.getContractFactory(CONTRACT_NAME);
  const sciAuthorizer = await SCIAuthorizerFactory.deploy();

  await saveDeployment(sciAuthorizer, CONTRACT_NAME);
  await logDeployment(sciAuthorizer, CONTRACT_NAME, []);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

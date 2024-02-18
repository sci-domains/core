import { ethers } from 'hardhat';
import { CONTRACT_NAMES, logDeployment, saveDeployment } from './utils';

async function main() {
  const SCIAuthorizerFactory = await ethers.getContractFactory(CONTRACT_NAMES.SCI_AUTHORIZER);
  const sciAuthorizer = await SCIAuthorizerFactory.deploy();

  await saveDeployment(sciAuthorizer, CONTRACT_NAMES.SCI_AUTHORIZER);
  await logDeployment(sciAuthorizer, CONTRACT_NAMES.SCI_AUTHORIZER, []);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

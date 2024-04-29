import { ethers } from 'hardhat';
import {
  CONTRACT_NAMES,
  deploy,
  getDeploymentAddress,
  logDeployment,
  saveDeployment,
} from '../utils';
import { IS_AUTHORIZED } from '../../utils/roles';

async function main() {
  const SCIAuthorizerFactory = await ethers.getContractFactory(CONTRACT_NAMES.SCI_AUTHORIZER);
  const sciAuthorizer = await deploy(SCIAuthorizerFactory);

  await sciAuthorizer.grantRole(IS_AUTHORIZED, await getDeploymentAddress());

  await saveDeployment(sciAuthorizer, CONTRACT_NAMES.SCI_AUTHORIZER);
  await logDeployment(sciAuthorizer, CONTRACT_NAMES.SCI_AUTHORIZER, []);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

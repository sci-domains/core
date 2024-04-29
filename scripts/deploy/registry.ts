import { ethers } from 'hardhat';
import { ADD_AUTHORIZER_ROLE } from '../../utils/roles';
import {
  CONTRACT_NAMES,
  deploy,
  getDeployedContractAddress,
  getDeploymentAddress,
  logDeployment,
  saveDeployment,
} from '../utils';

async function main() {
  const nameHashAddress = await getDeployedContractAddress(CONTRACT_NAMES.NAME_HASH);

  const RegistryFactory = await ethers.getContractFactory(CONTRACT_NAMES.REGISTRY);
  const registry = await deploy(RegistryFactory, [nameHashAddress]);

  await saveDeployment(registry, CONTRACT_NAMES.REGISTRY);
  await logDeployment(registry, CONTRACT_NAMES.REGISTRY, [nameHashAddress]);

  await registry.grantRole(ADD_AUTHORIZER_ROLE, await getDeploymentAddress());
  const sciAuthorizer = await getDeployedContractAddress('SciAuthorizer');
  await registry.setAuthorizer(1, sciAuthorizer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

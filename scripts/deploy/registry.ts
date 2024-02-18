import { ethers } from 'hardhat';
import { ADD_AUTHORIZER_ROLE } from '../../utils/roles';
import { logDeployment, saveDeployment } from './utils';

const NAME_HASH_ADDRESS = '0x65fc5b21BDd27726510F554b62E60e3cAA9B2C9A';
const SCI_AUTHORIZER = '0xe1da59CB197D6944ABDfC6D37CbDd20FaD567dc7';
const CONTRACT_NAME = 'Registry';
async function main() {
  const RegistryFactory = await ethers.getContractFactory(CONTRACT_NAME);
  const registry = await RegistryFactory.deploy(NAME_HASH_ADDRESS);

  await saveDeployment(registry, CONTRACT_NAME);
  await logDeployment(registry, CONTRACT_NAME, [NAME_HASH_ADDRESS]);

  await registry.grantRole(ADD_AUTHORIZER_ROLE, await ethers.provider.getSigner());
  await registry.setAuthorizer(1, SCI_AUTHORIZER);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from 'hardhat';

const NAME_HASH_ADDRESS = '0x65fc5b21BDd27726510F554b62E60e3cAA9B2C9A';
const SCI_AUTHORIZER = '0xe1da59CB197D6944ABDfC6D37CbDd20FaD567dc7';
async function main() {
  const RegistryFactory = await ethers.getContractFactory('Registry');
  const registry = await RegistryFactory.deploy(NAME_HASH_ADDRESS);
  // TODO: Add grant
  await registry.setAuthorizer(1, SCI_AUTHORIZER);
  console.log(`Deployed Registry to ${registry.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

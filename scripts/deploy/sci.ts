import { ethers, upgrades } from 'hardhat';
import { logDeployment, saveDeployment } from './utils';

const REGISTRY_ADDRESS = '0x9Fb83e16dC918CaFC1e57EC77Dd643A95f065a35';
const NAME_HASH_ADDRESS = '0x65fc5b21BDd27726510F554b62E60e3cAA9B2C9A';
const CONTRACT_NAME = 'SCI';
async function main() {
  const SCIFactory = await ethers.getContractFactory(CONTRACT_NAME);
  const sci = await upgrades.deployProxy(SCIFactory, [REGISTRY_ADDRESS, NAME_HASH_ADDRESS], {
    initializer: 'initialize',
  });
  await sci.deploy();

  await saveDeployment(sci, CONTRACT_NAME);
  await logDeployment(sci, CONTRACT_NAME, [REGISTRY_ADDRESS, NAME_HASH_ADDRESS]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

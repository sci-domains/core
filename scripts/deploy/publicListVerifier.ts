import { ethers } from 'hardhat';
import { logDeployment, saveDeployment } from './utils';

const REGISTRY_ADDRESS = '0x9Fb83e16dC918CaFC1e57EC77Dd643A95f065a35';
const CONTRACT_NAME = 'PublicListVerifier';
async function main() {
  const PublicListVerifierFactory = await ethers.getContractFactory(CONTRACT_NAME);
  const publicListVerifier = await PublicListVerifierFactory.deploy(REGISTRY_ADDRESS);

  await saveDeployment(publicListVerifier, CONTRACT_NAME);
  await logDeployment(publicListVerifier, CONTRACT_NAME, [REGISTRY_ADDRESS]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

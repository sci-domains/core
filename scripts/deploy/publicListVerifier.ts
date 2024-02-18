import { ethers } from 'hardhat';
import { CONTRACT_NAMES, getDeployedContractAddress, logDeployment, saveDeployment } from './utils';

async function main() {
  const registryAddress = await getDeployedContractAddress(CONTRACT_NAMES.REGISTRY);

  const PublicListVerifierFactory = await ethers.getContractFactory(
    CONTRACT_NAMES.PUBLIC_LIST_VERIFIER,
  );
  const publicListVerifier = await PublicListVerifierFactory.deploy(registryAddress);

  await saveDeployment(publicListVerifier, CONTRACT_NAMES.PUBLIC_LIST_VERIFIER);
  await logDeployment(publicListVerifier, CONTRACT_NAMES.PUBLIC_LIST_VERIFIER, [registryAddress]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from 'hardhat';

const REGISTRY_ADDRESS = '0x9Fb83e16dC918CaFC1e57EC77Dd643A95f065a35';
async function main() {
  const PublicListVerifierFactory = await ethers.getContractFactory('PublicListVerifier');
  const publicListVerifier = await PublicListVerifierFactory.deploy(REGISTRY_ADDRESS);
  console.log(`Deployed Public List Verifier to ${publicListVerifier.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

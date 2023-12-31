import { ethers, upgrades } from 'hardhat';

const REGISTRY_ADDRESS = '0x9Fb83e16dC918CaFC1e57EC77Dd643A95f065a35';
const NAME_HASH_ADDRESS = '0x65fc5b21BDd27726510F554b62E60e3cAA9B2C9A';

async function main() {
  const SCIFactory = await ethers.getContractFactory('SCI');
  const box = await upgrades.deployProxy(SCIFactory, [REGISTRY_ADDRESS, NAME_HASH_ADDRESS]);
  const sci = await SCIFactory.deploy();
  console.log(`Deployed SCI to ${sci.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

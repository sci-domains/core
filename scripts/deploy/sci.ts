import { ethers, upgrades } from 'hardhat';
import { CONTRACT_NAMES, getDeployedContractAddress, logDeployment, saveDeployment } from './utils';

async function main() {
  const registryAddress = await getDeployedContractAddress(CONTRACT_NAMES.REGISTRY);
  const nameHashAddress = await getDeployedContractAddress(CONTRACT_NAMES.NAME_HASH);

  const SCIFactory = await ethers.getContractFactory(CONTRACT_NAMES.SCI);
  const sci = await upgrades.deployProxy(SCIFactory, [registryAddress, nameHashAddress], {
    initializer: 'initialize',
  });
  await sci.waitForDeployment();

  await saveDeployment(sci, CONTRACT_NAMES.SCI);
  await logDeployment(sci, CONTRACT_NAMES.SCI, [registryAddress, nameHashAddress]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

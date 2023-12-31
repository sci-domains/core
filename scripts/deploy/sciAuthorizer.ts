import { ethers } from 'hardhat';
async function main() {
  const SCIAuthorizerFactory = await ethers.getContractFactory('SCIAuthorizer');
  const sciAuthorizer = await SCIAuthorizerFactory.deploy();
  console.log(`Deployed SCI Authorizer to ${sciAuthorizer.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

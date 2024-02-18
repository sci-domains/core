import { ethers } from 'hardhat';
import { BaseContract } from 'ethers';
import fs from 'fs';

export const DEPLOYMENT_FOLDER = './deployments';

export async function saveDeployment(contract: BaseContract, contractName: string) {
  const network = await ethers.provider.getNetwork();

  // Create the directory if it doesn't exist
  const filePath = `${DEPLOYMENT_FOLDER}/${network.name}`;
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }

  fs.writeFileSync(
    `${filePath}/${contractName}.json`,
    JSON.stringify(
      {
        address: contract.target,
        bytecode: await contract.getDeployedCode(),
      },
      null,
      2,
    ),
  );
}

export async function logDeployment(contract: BaseContract, contractName: string, args: string[]) {
  console.log(`Deployed ${contractName} to ${contract.target}`);
  const network = await ethers.provider.getNetwork();
  console.log(
    `To verify it run:\nyarn hardhat verify --network ${network.name} ${
      contract.target
    } ${args.join(' ')}`,
  );
}

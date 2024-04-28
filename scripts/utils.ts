import { defender, ethers } from 'hardhat';
import { BaseContract, Contract, ContractFactory } from 'ethers';
import fs from 'fs';

export enum CONTRACT_NAMES {
  REGISTRY = 'Registry',
  NAME_HASH = 'NameHash',
  PUBLIC_LIST_VERIFIER = 'PublicListVerifier',
  SCI = 'SCI',
  SCI_AUTHORIZER = 'SCIAuthorizer',
}

const DEPLOYMENT_FOLDER = './deployments';

async function generateDeploymentPath(): Promise<string> {
  const network = await ethers.provider.getNetwork();
  return `${DEPLOYMENT_FOLDER}/${network.name}`;
}

export async function deploy(factory: ContractFactory, args?: unknown[]): Promise<Contract> {
  return await defender.deployContract(factory, {
    constructorArgs: args,
    salt: 'oGxABr7U4iCnq598aK5Ai25jcgXq6kbaAD859BJWJ2ytvJkzpy',
    verifySourceCode: true,
  });
}

export async function saveDeployment(contract: BaseContract, contractName: string) {
  const filePath = await generateDeploymentPath();

  // Create the directory if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }

  fs.writeFileSync(
    `${filePath}/${contractName}.json`,
    JSON.stringify(
      {
        address: contract.target,
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

export async function getDeployedContractAddress(contractName: string): Promise<string> {
  const filePath = await generateDeploymentPath();
  const deploymentFile = JSON.parse(fs.readFileSync(`${filePath}/${contractName}.json`).toString());
  return deploymentFile.address;
}

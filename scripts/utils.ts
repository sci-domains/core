import { ethers, network } from 'hardhat';
import { BaseContract } from 'ethers';
import fs from 'fs';
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { ContractTransaction } from 'ethers/lib.esm';

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

export async function sendTransactionsViaSafe(
  ethersTransactions: ContractTransaction[],
  safeAddress: string,
) {
  let protocolKit = await Safe.init({
    provider: network.provider,
    safeAddress,
  });

  protocolKit = await protocolKit.connect({});

  const ethersNetwork = await ethers.provider.getNetwork();
  const apiKit = new SafeApiKit({
    chainId: ethersNetwork.chainId,
  });

  const safeTransaction = await protocolKit.createTransaction({
    transactions: ethersTransactions.map((tx) => {
      return {
        to: tx.to,
        value: tx.value ? tx.value.toString() : '0',
        data: tx.data,
      };
    }),
  });
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signature = await protocolKit.signHash(safeTxHash);

  await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: signature.signer,
    senderSignature: signature.data,
  });
}

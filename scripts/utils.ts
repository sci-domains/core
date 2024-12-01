import { ethers, network } from 'hardhat';
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { ContractTransaction } from 'ethers/lib.esm';
import * as fs from "fs";

type DeploymentAddresses = {
  "SciRegistry#SciRegistry": string,
  "PublicListVerifier#PublicListVerifier": string,
  "SciRegstrar#SciRegistrar": string,
  "ProxyModule#SCI": string,
  "ProxyModule#TransparentUpgradeableProxy": string,
  "ProxyModule#ProxyAdmin": string,
  "SciModule#SCI": string
}


export async function getDeployedContractAddress(): Promise<DeploymentAddresses> {
  const network = await ethers.provider.getNetwork();
  const path = `ignition/deployments/chain-${network.chainId}/deployed_addresses.json`;
  return JSON.parse(fs.readFileSync(path).toString());
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

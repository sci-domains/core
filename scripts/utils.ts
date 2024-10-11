import { ethers, network } from 'hardhat';
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { ContractTransaction } from 'ethers/lib.esm';

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

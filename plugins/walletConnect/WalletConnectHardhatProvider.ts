import { ProviderWrapper } from 'hardhat/plugins';
import { EIP1193Provider, RequestArguments } from 'hardhat/types';
import EthereumProvider from '@walletconnect/ethereum-provider';

export class WalletConnectHardhatProvider extends ProviderWrapper {
  constructor(
    _wrappedProvider: EIP1193Provider,
    private readonly wcProvider: EthereumProvider,
  ) {
    super(_wrappedProvider);
  }

  async request(args: RequestArguments) {
    console.log(args);
    switch (args.method) {
      case 'eth_estimateGas':
      case 'eth_sendTransaction':
      case 'eth_sendRawTransaction':
      case 'eth_accounts':
        return this.wcProvider.request(args);
    }

    return this._wrappedProvider.request(args);
  }
}

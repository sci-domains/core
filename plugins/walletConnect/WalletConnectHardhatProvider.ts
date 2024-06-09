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
    if (args.method === 'eth_sendTransaction') {
      return this.wcProvider.request(args);
    }
    if (args.method === 'eth_sendRawTransaction') {
      return this.wcProvider.request(args);
    }
    if (args.method === 'eth_accounts') {
      return this.wcProvider.request(args);
    }

    return this._wrappedProvider.request(args);
  }
}

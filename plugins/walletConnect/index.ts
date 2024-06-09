import './WalletConnectHardhatProvider';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { extendProvider } from 'hardhat/config';
import { WalletConnectHardhatProvider } from './WalletConnectHardhatProvider';
import { HttpNetworkUserConfig } from 'hardhat/types/config';

extendProvider(async (provider, config, network) => {
  if (
    !config.networks[network] ||
    !(config.networks[network] as HttpNetworkUserConfig).useWalletConnect
  ) {
    return provider;
  }

  const wcProvider = await EthereumProvider.init(config.walletConnect);
  // We fix the gas price to be set by the config or to a random high value
  wcProvider.on('display_uri', (wcUri: string) => {
    console.log(`https://kissapi-qrcode.vercel.app/api/qrcode?chl=${encodeURIComponent(wcUri)}`);
    console.log(wcUri);
  });

  wcProvider.on('connect', () => {
    console.log('Connected');
  });

  await wcProvider.enable();

  return new WalletConnectHardhatProvider(provider, wcProvider);
});

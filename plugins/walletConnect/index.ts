import './WalletConnectHardhatProvider';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { extendProvider } from 'hardhat/config';
import { WalletConnectHardhatProvider } from './WalletConnectHardhatProvider';
import { HttpNetworkUserConfig } from 'hardhat/types/config';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

const BASE_QR_CODE_URL = 'https://kissapi-qrcode.vercel.app/api/qrcode?chl=';

extendProvider(async (provider, config, network) => {
  const networkConfig = config.networks[network] as HttpNetworkUserConfig;
  if (!networkConfig || !networkConfig.useWalletConnect) {
    return provider;
  }

  const baseUrl = networkConfig.qrCodeUrl ?? BASE_QR_CODE_URL;

  const wcProvider = await EthereumProvider.init(config.walletConnect);

  wcProvider.on('display_uri', (wcUri: string) => {
    console.log(`${baseUrl}${encodeURIComponent(wcUri)}`);
    console.log(wcUri);
  });

  wcProvider.on('connect', () => {
    console.log('Connected');
  });

  await wcProvider.connect();

  return new WalletConnectHardhatProvider(provider, wcProvider);
});

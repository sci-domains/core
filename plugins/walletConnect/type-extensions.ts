import 'hardhat/types/config';
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    walletConnect: EthereumProviderOptions;
  }
  interface HardhatConfig {
    walletConnect: EthereumProviderOptions;
  }

  interface HttpNetworkUserConfig {
    useWalletConnect?: boolean;
    qrCodeUrl?: string;
  }
}

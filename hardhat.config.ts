import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import '@openzeppelin/hardhat-upgrades';
import 'dotenv/config';
import './plugins/walletConnect/index';

function getAccounts(privateKey: string | undefined): string[] {
  return privateKey ? [privateKey] : [];
}

function getUrl(url: string | undefined): string {
  return url ?? '';
}

const config: HardhatUserConfig = {
  solidity: '0.8.25',
  gasReporter: {
    currency: 'USD',
    enabled: true,
    coinmarketcap: process.env.COIN_MARKET_CAP_API_KEY,
  },
  typechain: {
    outDir: 'types',
  },
  networks: {
    sepolia: {
      chainId: 11155111,
      url: getUrl(process.env.ETHEREUM_SEPOLIA_PROVIDER_URL),
    },
    mainnet: {
      chainId: 1,
      url: getUrl(process.env.ETHEREUM_MAINNET_PROVIDER_URL),
      useWalletConnect: true,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
  sourcify: {
    enabled: false,
  },
  walletConnect: {
    projectId: process.env.WALLET_CONNECT_PROJECT_ID!,
    metadata: {
      name: 'SCI',
      description: 'SCI Deployer',
      url: 'https://sci.domains',
      icons: ['https://www.sci.domains/images/logo/sci_logo.svg'],
    },
    showQrModal: false,
    optionalChains: [1],
  },
};

export default config;

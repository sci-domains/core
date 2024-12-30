import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import '@openzeppelin/hardhat-upgrades';
import '@nomicfoundation/hardhat-ledger';
import '@nomicfoundation/hardhat-ignition-ethers';
import 'dotenv/config';

function getUrl(url: string | undefined): string {
  return url ?? '';
}

const config: HardhatUserConfig = {
  solidity: '0.8.28',
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
      ledgerAccounts: [process.env.ADDRESS!],
    },
    mainnet: {
      chainId: 1,
      url: getUrl(process.env.ETHEREUM_MAINNET_PROVIDER_URL),
    },
    optimism: {
      chainId: 10,
      url: getUrl(process.env.OPTIMISM_PROVIDER_URL),
      ledgerAccounts: [process.env.ADDRESS!],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
  sourcify: {
    enabled: false,
  },
};

export default config;

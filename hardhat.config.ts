import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import 'solidity-coverage'
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-ignition-ethers";
import 'dotenv/config';

function getAccounts(privateKey: string | undefined): string[] {
  return privateKey ? [privateKey] : [];
}

function getUrl(url: string | undefined): string {
  return url ?? '';
}

const config: HardhatUserConfig = {
  solidity: '0.8.26',
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
      url: getUrl(process.env.ETHEREUM_SEPOLIA_PROVIDER_URL)
    },
    mainnet: {
      chainId: 1,
      url: getUrl(process.env.ETHEREUM_MAINNET_PROVIDER_URL)
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

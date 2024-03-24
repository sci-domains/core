import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import '@openzeppelin/hardhat-upgrades';
import 'dotenv/config';

function getAccounts(privateKey: string | undefined): string[] {
  return privateKey ? [privateKey] : [];
}

function getUrl(url: string | undefined): string {
  return url ?? '';
}

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  gasReporter: {
    gasPrice: 32,
    enabled: true,
  },
  typechain: {
    outDir: 'types',
  },
  networks: {
    goerli: {
      chainId: 5,
      url: getUrl(process.env.ETHEREUM_GOERLI_PROVIDER_URL),
      accounts: getAccounts(process.env.ETHEREUM_GOERLI_PRIVATE_KEY),
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

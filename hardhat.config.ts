import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import '@nomicfoundation/hardhat-network-helpers';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
};

export default config;

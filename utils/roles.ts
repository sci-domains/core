import { ethers } from 'hardhat';

export const ADD_AUTHORIZER_ROLE = ethers.keccak256(Buffer.from('ADD_AUTHORIZER_ROLE'));

export const IS_AUTHORIZED = ethers.keccak256(Buffer.from('IS_AUTHORIZED'));
export const DEFAULT_ADMIN_ROLE =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

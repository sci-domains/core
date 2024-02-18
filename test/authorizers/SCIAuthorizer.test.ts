import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SCIAuthorizer } from '../../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { IS_AUTHORIZED } from '../../utils/roles';

const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';

describe('SCIAuthorizer', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sciAuthorizer: SCIAuthorizer;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();
    // Ens Authorization Contract Deployment
    const SCIAuthorizerFactory = await ethers.getContractFactory('SCIAuthorizer');
    sciAuthorizer = await SCIAuthorizerFactory.deploy();
  });

  describe('Is Authorized', function () {
    it('It should return true if owner has the IS_AUTHORIZED role ', async function () {
      await sciAuthorizer.grantRole(IS_AUTHORIZED, owner.address);
      expect(await sciAuthorizer.isAuthorized(owner, DOMAIN_HASH)).to.true;
    });

    it("It should return false if is doesn't have the IS_AUTHORIZED role", async function () {
      expect(await sciAuthorizer.isAuthorized(owner, DOMAIN_HASH)).to.false;
    });
  });
});

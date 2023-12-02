import { ethers } from 'hardhat';
import {
  Registry,
  AlwaysTrueAuthorizer,
  AlwaysFalseAuthorizer,
} from '../typechain-types';
import { expect } from 'chai';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ALWAYS_TRUE_AUTHORIZER_ID = 1;
const ALWAYS_FALSE_AUTHORIZER_ID = 2;
const DOMAIN = 'secureci.xyz';
const CHAIN_ID = 1;

describe('Registry', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let registry: Registry;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let alwaysFalseAuthorizer: AlwaysFalseAuthorizer;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const SCIRegistryFactory = await ethers.getContractFactory('Registry');
    registry = await SCIRegistryFactory.deploy();

    const AlwaysTrueAuthorizer = await ethers.getContractFactory(
      'AlwaysTrueAuthorizer',
    );
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await registry.addAuthorizer(
      ALWAYS_TRUE_AUTHORIZER_ID,
      alwaysTrueAuthorizer,
    );

    const AlwaysFalseAuthorizer = await ethers.getContractFactory(
      'AlwaysFalseAuthorizer',
    );
    alwaysFalseAuthorizer = await AlwaysFalseAuthorizer.deploy();
    await registry.addAuthorizer(
      ALWAYS_FALSE_AUTHORIZER_ID,
      alwaysFalseAuthorizer,
    );
  });

  describe('Add authorizer', function () {
    it('Should only let the owner add an authorizer', async function () {
      await registry.addAuthorizer(
        ALWAYS_TRUE_AUTHORIZER_ID,
        alwaysTrueAuthorizer,
      );
      expect(await registry.authorizers(ALWAYS_TRUE_AUTHORIZER_ID)).to.equal(
        alwaysTrueAuthorizer.target,
      );

      await expect(
        registry
          .connect(addresses[1])
          .addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer),
      ).revertedWithCustomError(registry, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Registering domains', function () {
    // registry.
  });
});

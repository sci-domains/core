import { ethers } from 'hardhat';
import {
  Registry,
  Authorizer,
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
  let sciRegistry: Registry;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let alwaysFalseAuthorizer: AlwaysFalseAuthorizer;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const SCIRegistryFactory = await ethers.getContractFactory('Registry');
    sciRegistry = await SCIRegistryFactory.deploy();

    const AlwaysTrueAuthorizer = await ethers.getContractFactory(
      'AlwaysTrueAuthorizer',
    );
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await sciRegistry.addAuthorizer(
      ALWAYS_TRUE_AUTHORIZER_ID,
      alwaysTrueAuthorizer,
    );

    const AlwaysFalseAuthorizer = await ethers.getContractFactory(
      'AlwaysFalseAuthorizer',
    );
    alwaysFalseAuthorizer = await AlwaysFalseAuthorizer.deploy();
    await sciRegistry.addAuthorizer(
      ALWAYS_FALSE_AUTHORIZER_ID,
      alwaysFalseAuthorizer,
    );
  });

  describe('Add authorizer', function () {
    it('Should let the owner add an authorizer', async function () {
      await sciRegistry.addAuthorizer(
        ALWAYS_TRUE_AUTHORIZER_ID,
        alwaysTrueAuthorizer,
      );
      expect(await sciRegistry.authorizers(ALWAYS_TRUE_AUTHORIZER_ID)).to.equal(
        alwaysTrueAuthorizer.target,
      );
    });

    it("Shouldn't let a non owner user add an authorizer", async function () {
      await expect(
        sciRegistry
          .connect(addresses[1])
          .addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer),
      ).revertedWithCustomError(sciRegistry, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Add addresses', function () {
    it('Should let a valid domain owner add multiple address', async function () {
      const domainOwner = addresses[0];
      const addressesToAdd = [
        addresses[1].address,
        addresses[2].address,
        addresses[3].address,
      ];

      await sciRegistry.addAddresses(
        ALWAYS_TRUE_AUTHORIZER_ID,
        DOMAIN,
        CHAIN_ID,
        addressesToAdd,
      );

      expect(
        await sciRegistry.whitelist(DOMAIN, CHAIN_ID, addressesToAdd[0]),
      ).to.equal(true);
      expect(
        await sciRegistry.whitelist(DOMAIN, CHAIN_ID, addressesToAdd[1]),
      ).to.equal(true);
      expect(
        await sciRegistry.whitelist(DOMAIN, CHAIN_ID, addressesToAdd[2]),
      ).to.equal(true);
      expect(
        await sciRegistry.whitelist(DOMAIN, CHAIN_ID, addresses[4].address),
      ).to.equal(false);
    });

    it('Should emit event', async function () {
      const domainOwner = addresses[0];
      const addressesToAdd = [
        addresses[1].address,
        addresses[2].address,
        addresses[3].address,
      ];

      await expect(
        sciRegistry
          .connect(domainOwner)
          .addAddresses(
            ALWAYS_TRUE_AUTHORIZER_ID,
            DOMAIN,
            CHAIN_ID,
            addressesToAdd,
          ),
      )
        .emit(sciRegistry, 'AddressesAddedToDomain')
        .withArgs(
          ALWAYS_TRUE_AUTHORIZER_ID,
          domainOwner.address,
          DOMAIN,
          CHAIN_ID,
          addressesToAdd,
        );
    });

    it("Shouldn't let an invalid domain owner add address", async function () {
      const addressesToAdd = [
        addresses[1].address,
        addresses[2].address,
        addresses[3].address,
      ];
      await expect(
        sciRegistry.addAddresses(
          ALWAYS_FALSE_AUTHORIZER_ID,
          DOMAIN,
          CHAIN_ID,
          addressesToAdd,
        ),
      ).revertedWithCustomError(sciRegistry, 'AccountIsNotDomainOwner');

      expect(
        await sciRegistry.whitelist(DOMAIN, CHAIN_ID, addressesToAdd[0]),
      ).to.equal(false);
      expect(
        await sciRegistry.whitelist(DOMAIN, CHAIN_ID, addressesToAdd[1]),
      ).to.equal(false);
      expect(
        await sciRegistry.whitelist(DOMAIN, CHAIN_ID, addressesToAdd[2]),
      ).to.equal(false);
    });
  });
});

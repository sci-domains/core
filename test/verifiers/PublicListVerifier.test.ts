import { ethers } from 'hardhat';
import { ADD_AUTHORIZER_ROLE } from '../../utils/roles';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { AlwaysTrueAuthorizer, PublicListVerifier, Registry } from '../../typechain-types';
import { expect } from 'chai';
import { MaxUint256 } from 'ethers';

const ALWAYS_TRUE_AUTHORIZER_ID = 1;
const CHAIN_ID = 1;
const DOMAIN = 'secureci.xyz';
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_WITH_WILDCARD_HASH =
  '0x1716343d0689cbd485fdf69796462e95bb6ff7a1249660b9fcf2fdd6c6c04f0e';

describe('Public List Verifier', function () {
  let owner: HardhatEthersSigner;
  let domainOwner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let registry: Registry;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, domainOwner, ...addresses] = await ethers.getSigners();

    const NameHashFactory = await ethers.getContractFactory('NameHash');
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory('Registry');
    registry = await RegistryFactory.deploy(await nameHash.getAddress());
    await registry.grantRole(ADD_AUTHORIZER_ROLE, owner.address);

    const AlwaysTrueAuthorizer = await ethers.getContractFactory('AlwaysTrueAuthorizer');
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await registry.addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer);

    const PubicListVerifierFactory = await ethers.getContractFactory('PublicListVerifier');
    publicListverifier = await PubicListVerifierFactory.deploy(registry.target);

    await registry.registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, false);
  });

  describe('Add Addresses', function () {
    it('Should let only the owner of the domain add addresses for the domain', async function () {
      const notOwner = addresses[0];
      const chainId = 1;
      await expect(
        publicListverifier
          .connect(notOwner)
          .addAddresses(DOMAIN_HASH, [registry.target], [[chainId]]),
      )
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      await publicListverifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [registry.target], [[chainId]]);
      expect(await publicListverifier.verifiedContracts(DOMAIN_HASH, registry.target, CHAIN_ID)).to
        .be.true;
    });
  });

  describe('Remove Addresses', function () {
    it('Should let only the owner of the domain remove addresses for the domain', async function () {
      const notOwner = addresses[0];
      const chainId = 1;
      await publicListverifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [registry.target], [[chainId]]);

      await expect(
        publicListverifier
          .connect(notOwner)
          .removeAddresses(DOMAIN_HASH, [registry.target], [[chainId]]),
      )
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      await publicListverifier
        .connect(domainOwner)
        .removeAddresses(DOMAIN_HASH, [registry.target], [[chainId]]);
      expect(await publicListverifier.verifiedContracts(DOMAIN_HASH, registry.target, CHAIN_ID)).to
        .be.false;
    });
  });

  describe('Verify Address', function () {
    beforeEach(async () => {
      await publicListverifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [registry.target], [[1]]);
    });

    it('Should return true for a verified address', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, registry.target, CHAIN_ID)).to.be
        .true;
    });

    it('Should return true for any chain if it is with the multi chain id', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, registry.target, CHAIN_ID + 1)).to.be
        .false;
      await publicListverifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [registry.target], [[MaxUint256]]);
      expect(await publicListverifier.isVerified(DOMAIN_HASH, registry.target, CHAIN_ID + 1)).to.be
        .true;
    });

    it('Should return false for a verified address in a wrong chain', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, registry.target, CHAIN_ID + 1)).to.be
        .false;
    });

    it('Should return false for an unverified address', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, publicListverifier.target, CHAIN_ID))
        .to.be.false;
    });

    it('Should return false for an unregistered domain', async function () {
      expect(
        await publicListverifier.isVerified(DOMAIN_WITH_WILDCARD_HASH, registry.target, CHAIN_ID),
      ).to.be.false;
    });
  });
});

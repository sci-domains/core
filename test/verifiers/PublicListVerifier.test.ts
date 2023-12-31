import { ethers } from 'hardhat';
import { ADD_AUTHORIZER_ROLE } from '../../utils/roles';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { AlwaysTrueAuthorizer, PublicListVerifier, RegistryV0 } from '../../typechain-types';
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
  let registry: RegistryV0;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, domainOwner, ...addresses] = await ethers.getSigners();

    const NameHashFactory = await ethers.getContractFactory('NameHash');
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory('RegistryV0');
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
        publicListverifier.connect(notOwner).addAddress(DOMAIN_HASH, chainId, registry.target),
      )
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      await publicListverifier
        .connect(domainOwner)
        .addAddress(DOMAIN_HASH, chainId, registry.target);
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
        .addAddress(DOMAIN_HASH, chainId, registry.target);

      await expect(
        publicListverifier.connect(notOwner).removeAddress(DOMAIN_HASH, chainId, registry.target),
      )
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      await publicListverifier
        .connect(domainOwner)
        .removeAddress(DOMAIN_HASH, chainId, registry.target);
      expect(await publicListverifier.verifiedContracts(DOMAIN_HASH, registry.target, CHAIN_ID)).to
        .be.false;
    });
  });

  describe('Verify Address', function () {
    beforeEach(async () => {
      await publicListverifier.connect(domainOwner).addAddress(DOMAIN_HASH, 1, registry.target);
    });

    it('Should return true for a verified address', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, CHAIN_ID, registry.target)).to.be
        .true;
    });

    it('Should return true for any chain if it is with the multi chain id', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, CHAIN_ID + 1, registry.target)).to.be
        .false;
      await publicListverifier
        .connect(domainOwner)
        .addAddress(DOMAIN_HASH, MaxUint256, registry.target);
      expect(await publicListverifier.isVerified(DOMAIN_HASH, CHAIN_ID + 1, registry.target)).to.be
        .true;
    });

    it('Should return false for a verified address in a wrong chain', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, CHAIN_ID + 1, registry.target)).to.be
        .false;
    });

    it('Should return false for an unverified address', async function () {
      expect(await publicListverifier.isVerified(DOMAIN_HASH, CHAIN_ID, publicListverifier.target))
        .to.be.false;
    });

    it('Should return false for an unregistered domain', async function () {
      expect(
        await publicListverifier.isVerified(DOMAIN_WITH_WILDCARD_HASH, CHAIN_ID, registry.target),
      ).to.be.false;
    });
  });
});

import { ethers } from 'hardhat';
import {
  RegistryV0,
  AlwaysTrueAuthorizer,
  AlwaysFalseAuthorizer,
  PublicListVerifier,
} from '../typechain-types';
import { expect } from 'chai';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ADD_AUTHORIZER_ROLE, ADD_TRUSTED_VERIFIER_ROLE } from '../utils/roles';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ALWAYS_TRUE_AUTHORIZER_ID = 1;
const ALWAYS_FALSE_AUTHORIZER_ID = 2;
const DOMAIN = 'secureci.xyz';
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_WITH_WILDCARD_HASH =
  '0x1716343d0689cbd485fdf69796462e95bb6ff7a1249660b9fcf2fdd6c6c04f0e';

describe('RegistryV0', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let registry: RegistryV0;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let alwaysFalseAuthorizer: AlwaysFalseAuthorizer;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const NameHashFactory = await ethers.getContractFactory('NameHash');
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory('RegistryV0');
    registry = await RegistryFactory.deploy(await nameHash.getAddress());
    await registry.grantRole(ADD_AUTHORIZER_ROLE, owner.address);
    await registry.grantRole(ADD_TRUSTED_VERIFIER_ROLE, owner.address);

    const AlwaysTrueAuthorizer = await ethers.getContractFactory('AlwaysTrueAuthorizer');
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await registry.addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer);

    const AlwaysFalseAuthorizer = await ethers.getContractFactory('AlwaysFalseAuthorizer');
    alwaysFalseAuthorizer = await AlwaysFalseAuthorizer.deploy();
    await registry.addAuthorizer(ALWAYS_FALSE_AUTHORIZER_ID, alwaysFalseAuthorizer);

    const PubicListVerifierFactory = await ethers.getContractFactory('PublicListVerifier');
    publicListverifier = await PubicListVerifierFactory.deploy(registry.target);
  });

  describe('Add authorizer', function () {
    it('Should only let the owner add an authorizer', async function () {
      await registry.addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer);
      expect(await registry.authorizers(ALWAYS_TRUE_AUTHORIZER_ID)).to.equal(
        alwaysTrueAuthorizer.target,
      );

      const notOwner = addresses[1];
      await expect(
        registry.connect(notOwner).addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer),
      )
        .revertedWithCustomError(registry, 'AccessControlUnauthorizedAccount')
        .withArgs(notOwner.address, ADD_AUTHORIZER_ROLE);
    });

    it('Should emit an event when an authorizer is added', async function () {
      await expect(registry.addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer))
        .to.emit(registry, 'AuthorizerAdded')
        .withArgs(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer.target, owner.address);
    });
  });

  describe('Registering domains', function () {
    it('Should emit an event when a domain is registered', async function () {
      const domainOwner = addresses[0];
      await expect(
        registry
          .connect(domainOwner)
          .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, false),
      )
        .to.emit(registry, 'DomainRegistered')
        .withArgs(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner.address, DOMAIN_HASH, DOMAIN);
    });

    it('Should register a domain successfully', async function () {
      const domainOwner = addresses[0];
      await registry
        .connect(domainOwner)
        .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, false);
      expect(await registry.domainHashToRecord(DOMAIN_HASH)).to.deep.equal([
        domainOwner.address,
        ZERO_ADDRESS,
      ]);
    });

    it('Should register a domain with wildcard successfully', async function () {
      const domainOwner = addresses[0];
      await registry
        .connect(domainOwner)
        .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, true);
      expect(await registry.domainHashToRecord(DOMAIN_WITH_WILDCARD_HASH)).to.deep.equal([
        domainOwner.address,
        ZERO_ADDRESS,
      ]);
    });

    it("Shouldn't register a domain if the authorizer returns false", async function () {
      const notDomainOwner = addresses[0];
      expect(
        registry
          .connect(notDomainOwner)
          .registerDomain(ALWAYS_FALSE_AUTHORIZER_ID, notDomainOwner, DOMAIN, true),
      )
        .revertedWithCustomError(registry, 'AccountIsNotAuthorizeToRegisterDomain')
        .withArgs(notDomainOwner.address, DOMAIN);
    });
  });

  describe('Domain Owner', function () {
    // Hash name for another.domain.com
    const ANOTHER_DOMAIN_HASH =
      '0xd29501b869a19c374b0d1c05685438f2ad1fc613fe2f74032bf20cfb547e8bee';
    let domainOwner: HardhatEthersSigner;
    let notDomainOwner: HardhatEthersSigner;

    beforeEach(async () => {
      domainOwner = addresses[0];
      notDomainOwner = addresses[1];
      await registry
        .connect(domainOwner)
        .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, false);
    });

    it('Should return false if the domain is not registered', async function () {
      expect(await registry.isDomainOwner(ANOTHER_DOMAIN_HASH, domainOwner.address)).to.false;
    });

    it('Should return false if it is not the domain owner', async function () {
      expect(await registry.isDomainOwner(DOMAIN_HASH, notDomainOwner.address)).to.false;
    });

    it('Should return true if it is the domain owner', async function () {
      expect(await registry.isDomainOwner(DOMAIN_HASH, domainOwner.address)).to.true;
    });

    it('Should return the domain owner if it is a valid domain', async function () {
      expect(await registry.domainOwner(DOMAIN_HASH)).to.equal(domainOwner.address);
    });

    it('Should return the zero address if it was not register', async function () {
      expect(await registry.domainOwner(ANOTHER_DOMAIN_HASH)).to.equal(ZERO_ADDRESS);
    });
  });

  describe('Add Verifier', function () {
    let domainOwner: HardhatEthersSigner;
    let notDomainOwner: HardhatEthersSigner;

    beforeEach(async () => {
      domainOwner = addresses[0];
      notDomainOwner = addresses[1];
      await registry
        .connect(domainOwner)
        .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, false);
    });

    it('Should only let the owner of the domain add a verifier', async function () {
      await registry.connect(domainOwner).addVerifier(DOMAIN_HASH, publicListverifier.target);
      expect(await registry.domainVerifier(DOMAIN_HASH)).to.equal(publicListverifier.target);

      await expect(
        registry.connect(notDomainOwner).addVerifier(DOMAIN_HASH, publicListverifier.target),
      )
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notDomainOwner.address, DOMAIN_HASH);
    });

    it('Should emit an event when a verifier is added', async function () {
      await expect(
        registry.connect(domainOwner).addVerifier(DOMAIN_HASH, publicListverifier.target),
      )
        .to.emit(registry, 'VerifierAdded')
        .withArgs(domainOwner.address, DOMAIN_HASH, publicListverifier.target);
    });
  });
});

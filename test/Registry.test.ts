import { ethers } from 'hardhat';
import {
  Registry,
  AlwaysTrueAuthorizer,
  AlwaysFalseAuthorizer,
  PublicListVerifier,
} from '../types';
import { expect } from 'chai';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ADD_AUTHORIZER_ROLE, ADD_TRUSTED_VERIFIER_ROLE } from '../utils/roles';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ALWAYS_TRUE_AUTHORIZER_ID = 1;
const ALWAYS_FALSE_AUTHORIZER_ID = 2;
const DOMAIN = 'sci.domains';
const DOMAIN_HASH = '0x46b1531f39389a596f2e173d7e93cd0eaeafaf690c2a196e3f9054ce4cb20843';
const DOMAIN_WITH_WILDCARD_HASH =
  '0xb33e1da180b89d355773c7722ac9fa01c5b52aef3e3b6ceb67b664ccf75b382c';

describe('Registry', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let registry: Registry;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let alwaysFalseAuthorizer: AlwaysFalseAuthorizer;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const NameHashFactory = await ethers.getContractFactory('NameHash');
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory('Registry');
    registry = await RegistryFactory.deploy(await nameHash.getAddress());
    await registry.grantRole(ADD_AUTHORIZER_ROLE, owner.address);
    await registry.grantRole(ADD_TRUSTED_VERIFIER_ROLE, owner.address);

    const AlwaysTrueAuthorizer = await ethers.getContractFactory('AlwaysTrueAuthorizer');
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await registry.setAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer);

    const AlwaysFalseAuthorizer = await ethers.getContractFactory('AlwaysFalseAuthorizer');
    alwaysFalseAuthorizer = await AlwaysFalseAuthorizer.deploy();
    await registry.setAuthorizer(ALWAYS_FALSE_AUTHORIZER_ID, alwaysFalseAuthorizer);

    const PubicListVerifierFactory = await ethers.getContractFactory('PublicListVerifier');
    publicListverifier = await PubicListVerifierFactory.deploy(registry.target);
  });

  describe('Add authorizer', function () {
    it('Should only let the owner add an authorizer', async function () {
      await registry.setAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer);
      expect(await registry.authorizers(ALWAYS_TRUE_AUTHORIZER_ID)).to.equal(
        alwaysTrueAuthorizer.target,
      );

      const notOwner = addresses[1];
      await expect(
        registry.connect(notOwner).setAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer),
      )
        .revertedWithCustomError(registry, 'AccessControlUnauthorizedAccount')
        .withArgs(notOwner.address, ADD_AUTHORIZER_ROLE);
    });

    it('Should emit an event when an authorizer is added', async function () {
      await expect(registry.setAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer))
        .to.emit(registry, 'AuthorizerSet')
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

    it('Should emit an event when a domain is set', async function () {
      const domainOwner = addresses[0];
      await expect(
        registry
          .connect(domainOwner)
          .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, false),
      )
        .to.emit(registry, 'OwnerSet')
        .withArgs(domainOwner.address, DOMAIN_HASH, domainOwner.address);
    });

    it('Should register a domain successfully', async function () {
      const domainOwner = addresses[0];
      const tx = await registry
        .connect(domainOwner)
        .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, false);
      const block = await tx.getBlock();

      expect(await registry.domainHashToRecord(DOMAIN_HASH)).to.deep.equal([
        domainOwner.address,
        ZERO_ADDRESS,
        BigInt(block?.timestamp!),
        BigInt(0),
      ]);
    });

    it('Should register a domain with verifier successfully', async function () {
      const domainOwner = addresses[0];
      const verifierAddress = addresses[1].address;
      const tx = await registry
        .connect(domainOwner)
        .registerDomainWithVerifier(ALWAYS_TRUE_AUTHORIZER_ID, DOMAIN, false, verifierAddress);
      const block = await tx.getBlock();

      expect(await registry.domainHashToRecord(DOMAIN_HASH)).to.deep.equal([
        domainOwner.address,
        verifierAddress,
        BigInt(block?.timestamp!),
        BigInt(block?.timestamp!),
      ]);
    });

    it('Should register a domain with verifier and wildcard successfully', async function () {
      const domainOwner = addresses[0];
      const verifierAddress = addresses[1].address;
      const tx = await registry
        .connect(domainOwner)
        .registerDomainWithVerifier(ALWAYS_TRUE_AUTHORIZER_ID, DOMAIN, true, verifierAddress);
      const block = await tx.getBlock();

      expect(await registry.domainHashToRecord(DOMAIN_WITH_WILDCARD_HASH)).to.deep.equal([
        domainOwner.address,
        verifierAddress,
        BigInt(block?.timestamp!),
        BigInt(block?.timestamp!),
      ]);
    });

    it('Should register a domain with wildcard successfully', async function () {
      const domainOwner = addresses[0];
      const tx = await registry
        .connect(domainOwner)
        .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, domainOwner, DOMAIN, true);

      const block = await tx.getBlock();

      expect(await registry.domainHashToRecord(DOMAIN_WITH_WILDCARD_HASH)).to.deep.equal([
        domainOwner.address,
        ZERO_ADDRESS,
        BigInt(block?.timestamp!),
        BigInt(0),
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
      await registry.connect(domainOwner).setVerifier(DOMAIN_HASH, publicListverifier.target);
      expect(await registry.domainVerifier(DOMAIN_HASH)).to.equal(publicListverifier.target);

      await expect(
        registry.connect(notDomainOwner).setVerifier(DOMAIN_HASH, publicListverifier.target),
      )
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notDomainOwner.address, DOMAIN_HASH);
    });

    it('Should add the date when a verifier is set', async function () {
      const tx = await registry
        .connect(domainOwner)
        .setVerifier(DOMAIN_HASH, publicListverifier.target);
      const block = await tx.getBlock();
      expect(await registry.domainVerifierSetTime(DOMAIN_HASH)).to.equal(block?.timestamp!);

      await expect(
        registry.connect(notDomainOwner).setVerifier(DOMAIN_HASH, publicListverifier.target),
      )
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notDomainOwner.address, DOMAIN_HASH);
    });

    it('Should emit an event when a verifier is added', async function () {
      await expect(
        registry.connect(domainOwner).setVerifier(DOMAIN_HASH, publicListverifier.target),
      )
        .to.emit(registry, 'VerifierSet')
        .withArgs(domainOwner.address, DOMAIN_HASH, publicListverifier.target);
    });
  });
});

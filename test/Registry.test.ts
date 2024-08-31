import { ADD_AUTHORIZER_ROLE } from './../utils/roles';
import { ethers } from 'hardhat';
import {
  Registry,
  PublicListVerifier,
} from '../types';
import { expect } from 'chai';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const DOMAIN_HASH = '0x46b1531f39389a596f2e173d7e93cd0eaeafaf690c2a196e3f9054ce4cb20843';
const DOMAIN_WITH_WILDCARD_HASH =
  '0xb33e1da180b89d355773c7722ac9fa01c5b52aef3e3b6ceb67b664ccf75b382c';

describe('Registry', function () {
  let owner: HardhatEthersSigner;
  let registrar: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let registry: Registry;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, registrar, ...addresses] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory('Registry');
    registry = await RegistryFactory.deploy();

    await registry.grantRole(await registry.MANAGE_REGISTRAR_ROLE(), owner.address);
    registry.grantRole(await registry.REGISTRAR_ROLE(), registrar.address);

    const PubicListVerifierFactory = await ethers.getContractFactory('PublicListVerifier');
    publicListverifier = await PubicListVerifierFactory.deploy(registry.target);
  });

  describe('Manage Registrars', function () {
    it('Should only let an address with MANAGE_REGISTRAR_ROLE add a REGISTRAR_ROLE', async function () {
      const accountWithoutAddRegistrarRole = addresses[0];
      const newRegistrar = addresses[1];
      expect(await registry.hasRole(await registry.MANAGE_REGISTRAR_ROLE(), owner)).to.be.true;
      expect(await registry.hasRole(await registry.MANAGE_REGISTRAR_ROLE(), accountWithoutAddRegistrarRole)).to.be.false;
      expect(await registry.hasRole(await registry.REGISTRAR_ROLE(), newRegistrar)).to.be.false;
      
      await expect(registry.connect(accountWithoutAddRegistrarRole).grantRole(await registry.REGISTRAR_ROLE(), newRegistrar))
      .to.revertedWithCustomError(registry, 'AccessControlUnauthorizedAccount')
      .withArgs(accountWithoutAddRegistrarRole.address, await registry.MANAGE_REGISTRAR_ROLE());

      await registry.connect(owner).grantRole(await registry.REGISTRAR_ROLE(), newRegistrar);
      expect(await registry.hasRole(await registry.REGISTRAR_ROLE(), registrar)).to.be.true;
    });

    it('Should only let an address with MANAGE_REGISTRAR_ROLE remove a REGISTRAR_ROLE', async function () {
      const accountWithoutAddRegistrarRole = addresses[0];
      expect(await registry.hasRole(await registry.MANAGE_REGISTRAR_ROLE(), owner)).to.be.true;
      expect(await registry.hasRole(await registry.MANAGE_REGISTRAR_ROLE(), accountWithoutAddRegistrarRole)).to.be.false;
      expect(await registry.hasRole(await registry.REGISTRAR_ROLE(), registrar)).to.be.true;
      
      await expect(registry.connect(accountWithoutAddRegistrarRole).revokeRole(await registry.REGISTRAR_ROLE(), registrar))
      .to.revertedWithCustomError(registry, 'AccessControlUnauthorizedAccount')
      .withArgs(accountWithoutAddRegistrarRole.address, await registry.MANAGE_REGISTRAR_ROLE());

      await registry.connect(owner).revokeRole(await registry.REGISTRAR_ROLE(), registrar);
      expect(await registry.hasRole(await registry.REGISTRAR_ROLE(), registrar)).to.be.false;
    });
  });

  describe('Registering domains', function () {
    it('Should emit an event when a domain is registered', async function () {
      const domainOwner = addresses[1];
      await expect(
        registry
          .connect(registrar)
          .registerDomain(domainOwner, DOMAIN_HASH),
      )
        .to.emit(registry, 'DomainRegistered')
        .withArgs(registrar.address, domainOwner.address, DOMAIN_HASH);
    });

    it('Should emit an event when a domain is set', async function () {
      const domainOwner = addresses[0];
      await expect(
        registry
          .connect(registrar)
          .registerDomain(domainOwner, DOMAIN_HASH),
      )
        .to.emit(registry, 'OwnerSet')
        .withArgs(registrar.address, DOMAIN_HASH, domainOwner.address);
    });

    it('Should register a domain successfully', async function () {
      const domainOwner = addresses[0];
      const tx = await registry
        .connect(registrar)
        .registerDomain(domainOwner, DOMAIN_HASH);
      const block = await tx.getBlock();

      expect(await registry.domainHashToRecord(DOMAIN_HASH)).to.deep.equal([
        domainOwner.address,
        ethers.ZeroAddress,
        BigInt(block?.timestamp!),
        BigInt(0),
      ]);
    });

    it('Should register a domain with verifier successfully', async function () {
      const domainOwner = addresses[0];
      const verifierAddress = addresses[1].address;
      const tx = await registry
        .connect(registrar)
        .registerDomainWithVerifier(domainOwner, DOMAIN_HASH, verifierAddress);
      const block = await tx.getBlock();

      expect(await registry.domainHashToRecord(DOMAIN_HASH)).to.deep.equal([
        domainOwner.address,
        verifierAddress,
        BigInt(block?.timestamp!),
        BigInt(block?.timestamp!),
      ]);
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
        .connect(registrar)
        .registerDomain(domainOwner, DOMAIN_HASH);
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
      expect(await registry.domainOwner(ANOTHER_DOMAIN_HASH)).to.equal(ethers.ZeroAddress);
    });
  });

  describe('Add Verifier', function () {
    let domainOwner: HardhatEthersSigner;
    let notDomainOwner: HardhatEthersSigner;

    beforeEach(async () => {
      domainOwner = addresses[0];
      notDomainOwner = addresses[1];
      await registry
        .connect(registrar)
        .registerDomain(domainOwner, DOMAIN_HASH);
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

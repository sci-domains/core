import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import {
  Registry,
  AlwaysTrueAuthorizer,
  AlwaysFalseAuthorizer,
  PublicListVerifier,
} from '../typechain-types';
import { expect } from 'chai';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ADD_AUTHORIZER_ROLE } from './utils/roles';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ALWAYS_TRUE_AUTHORIZER_ID = 1;
const ALWAYS_TRUE_TTL = 50000;
const ALWAYS_FALSE_AUTHORIZER_ID = 2;
const DOMAIN = 'secureci.xyz';
const DOMAIN_WITH_WILDCARD = '*.secureci.xyz';
const CHAIN_ID = 1;

describe('Registry', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let registry: Registry;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let alwaysFalseAuthorizer: AlwaysFalseAuthorizer;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory('Registry');
    registry = await RegistryFactory.deploy();
    await registry.grantRole(ADD_AUTHORIZER_ROLE, owner.address);

    const AlwaysTrueAuthorizer = await ethers.getContractFactory('AlwaysTrueAuthorizer');
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await alwaysTrueAuthorizer.setTtl(ALWAYS_TRUE_TTL);
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
  });

  describe('Registering domains', function () {
    it('Should register a domain successfully', async function () {
      const domainOwner = addresses[0];
      await registry.connect(domainOwner).registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, DOMAIN, false);
      expect(await registry.domainToRecord(DOMAIN)).to.deep.equal([
        domainOwner.address,

        (await time.latest()) + ALWAYS_TRUE_TTL,
        ZERO_ADDRESS,
      ]);
    });

    it('Should register a domain with wildcard successfully', async function () {
      const domainOwner = addresses[0];
      await registry.connect(domainOwner).registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, DOMAIN, true);
      expect(await registry.domainToRecord(DOMAIN_WITH_WILDCARD)).to.deep.equal([
        domainOwner.address,
        (await time.latest()) + ALWAYS_TRUE_TTL,
        ZERO_ADDRESS,
      ]);
    });

    it("Shouldn't register a domain if the authorizer returns false", async function () {
      const notDomainOwner = addresses[0];
      expect(
        registry.connect(notDomainOwner).registerDomain(ALWAYS_FALSE_AUTHORIZER_ID, DOMAIN, true),
      )
        .revertedWithCustomError(registry, 'AccountIsNotAuthorizeToRegisterDomain')
        .withArgs(notDomainOwner.address, DOMAIN);
    });
  });

  describe('Domain ttl', function () {
    let domainOwner: HardhatEthersSigner;
    let domainTtl: number;

    beforeEach(async () => {
      domainOwner = addresses[0];
      await registry.connect(domainOwner).registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, DOMAIN, false);
      domainTtl = (await time.latest()) + ALWAYS_TRUE_TTL;
    });

    describe('Is Domain Valid', function () {
      it('Should return false if not domain was registered', async function () {
        expect(await registry.isDomainValid('another.domain.com')).to.false;
      });

      it('Should return false if the domain ttl expired', async function () {
        await time.increase(ALWAYS_TRUE_TTL + 1);
        expect(await registry.isDomainValid(DOMAIN)).to.false;
      });

      it('Should return true if the domain ttl is not expired', async function () {
        expect(await registry.isDomainValid(DOMAIN)).to.true;
        await time.increase(ALWAYS_TRUE_TTL - 1);
        expect(await registry.isDomainValid(DOMAIN)).to.true;
      });

      it('Should return the correct ttl', async function () {
        expect(await registry.domainTtl(DOMAIN)).to.equal(domainTtl);
      });

      it('Should return the correct ttl event if it expired', async function () {
        await time.increase(ALWAYS_TRUE_TTL + 1);
        expect(await registry.domainTtl(DOMAIN)).to.equal(domainTtl);
      });
    });

    describe('Domain Owner', function () {
      let domainOwner: HardhatEthersSigner;
      let notDomainOwner: HardhatEthersSigner;

      beforeEach(async () => {
        domainOwner = addresses[0];
        notDomainOwner = addresses[1];
        await registry
          .connect(domainOwner)
          .registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, DOMAIN, false);
      });

      it('Should return false if the domain is not registered', async function () {
        expect(await registry.isDomainOwner('another.domain.com', domainOwner.address)).to.false;
      });

      it('Should return false if it is not the domain owner', async function () {
        expect(await registry.isDomainOwner(DOMAIN, notDomainOwner.address)).to.false;
      });

      it('Should return true if it is the domain owner', async function () {
        expect(await registry.isDomainOwner(DOMAIN, domainOwner.address)).to.true;
      });

      it('Should return the domain owner if it is a valid domain', async function () {
        expect(await registry.domainOwner(DOMAIN)).to.equal(domainOwner.address);
      });

      it('Should return the zero address if it was not register', async function () {
        expect(await registry.domainOwner('another.domain.com')).to.equal(ZERO_ADDRESS);
      });

      it('Should return the zero address if the domain expired', async function () {
        await time.increase((await registry.domainTtl(DOMAIN)) + BigInt(1));
        expect(await registry.domainOwner(DOMAIN)).to.equal(ZERO_ADDRESS);
      });
    });
  });

  describe('Add Verifier', function () {
    let domainOwner: HardhatEthersSigner;
    let notDomainOwner: HardhatEthersSigner;

    beforeEach(async () => {
      domainOwner = addresses[0];
      notDomainOwner = addresses[1];
      await registry.connect(domainOwner).registerDomain(ALWAYS_TRUE_AUTHORIZER_ID, DOMAIN, false);
    });

    it('Should only let the owner of the domain add a verifier', async function () {
      await registry.connect(domainOwner).addVerifier(DOMAIN, publicListverifier.target);
      expect(await registry.domainVerifier(DOMAIN)).to.equal(publicListverifier.target);

      await expect(registry.connect(notDomainOwner).addVerifier(DOMAIN, publicListverifier.target))
        .revertedWithCustomError(registry, 'AccountIsNotDomainOwner')
        .withArgs(notDomainOwner.address, DOMAIN);
    });
  });
});

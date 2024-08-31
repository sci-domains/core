import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SciRegistrar, Registry } from '../../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';

describe('SciRegistrar', function () {
  let user: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sciRegistrar: SciRegistrar;
  let registry: Registry;

  beforeEach(async () => {
    [user, ...addresses] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("Registry");
    registry = await RegistryFactory.deploy();

    // Ens Authorization Contract Deployment
    const SciRegistrarFactory = await ethers.getContractFactory('SciRegistrar');
    sciRegistrar = await SciRegistrarFactory.deploy(registry);

    await registry.grantRole(await registry.MANAGE_REGISTRAR_ROLE(), user.address);
    registry.grantRole(await registry.REGISTRAR_ROLE(), sciRegistrar.target);
  });

  describe('Register domains', function () {
    it('It should register a domain with verifier if it has the REGISTER_DOMAIN_ROLE role', async function () {
      const verifier = addresses[0].address;
      await sciRegistrar.grantRole(await sciRegistrar.REGISTER_DOMAIN_ROLE(), user.address);

      await sciRegistrar.connect(user).registerDomainWithVerifier(DOMAIN_HASH, verifier);
      
      expect(await registry.isDomainOwner(DOMAIN_HASH, user)).to.be.true;
      expect(await registry.domainVerifier(DOMAIN_HASH)).to.equal(verifier);
    });

    it('It should register a domain if it if it has the REGISTER_DOMAIN_ROLE role', async function () {
      await sciRegistrar.grantRole(await sciRegistrar.REGISTER_DOMAIN_ROLE(), user.address);
      await sciRegistrar.registerDomain(user, DOMAIN_HASH);
      
      expect(await registry.isDomainOwner(DOMAIN_HASH, user)).to.be.true;
    });    

    it("It should reveret with AccessControlUnauthorizedAccount if it doesn't have the REGISTER_DOMAIN_ROLE role", async function () {
      await expect(sciRegistrar.registerDomain(user, DOMAIN_HASH))
      .to.revertedWithCustomError(sciRegistrar, 'AccessControlUnauthorizedAccount')
      .withArgs(user.address, await sciRegistrar.REGISTER_DOMAIN_ROLE());

      await expect(sciRegistrar.registerDomainWithVerifier(DOMAIN_HASH, ethers.ZeroAddress))
      .to.revertedWithCustomError(sciRegistrar, 'AccessControlUnauthorizedAccount')
      .withArgs(user.address, await sciRegistrar.REGISTER_DOMAIN_ROLE());
    });
  });
});

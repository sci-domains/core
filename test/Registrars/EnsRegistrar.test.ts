import { expect } from 'chai';
import { ethers } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { keccak256, namehash, toUtf8Bytes } from 'ethers';
import { EnsRegistrar, Registry } from '../../types';

const NON_EXISTING_DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_HASH = '0xfcec0ff58c10be0e399a3a51186968513cc3a4c572a51d688ff338b3fbf6a7f9';

describe('EnsRegistrar', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let ensRegistrar: EnsRegistrar;
  let registry: Registry;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    // ENS Contracts Deployment
    const EnsFactory = await ethers.getContractFactory('ENSRegistry');
    const ens = await EnsFactory.deploy();

    // Set ENS nodes for testing
    await ens.setSubnodeOwner(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      keccak256(toUtf8Bytes('eth')),
      owner.address,
    );
    await ens.setSubnodeOwner(namehash('eth'), keccak256(toUtf8Bytes('a')), owner.address);

    // SCI Contracts
    const NameHashFactory = await ethers.getContractFactory("NameHash");
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory("Registry");
    registry = await RegistryFactory.deploy();

    const EnsRegistrar = await ethers.getContractFactory('EnsRegistrar');
    ensRegistrar = await EnsRegistrar.deploy(ens.target, registry, nameHash);

    await registry.grantRole(await registry.REGISTRAR_MANAGER_ROLE(), owner.address);
    registry.grantRole(await registry.REGISTRAR_ROLE(), ensRegistrar.target);
  });

  describe('ENS Domain', function () {
    it("It should revert with AccountIsNotEnsOwner if the domain hash doesn't exist in ENS", async function () {
      await expect(ensRegistrar.registerDomain(owner, NON_EXISTING_DOMAIN_HASH))
      .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
      .withArgs(owner.address, NON_EXISTING_DOMAIN_HASH);

      await expect(ensRegistrar.registerDomainWithVerifier(NON_EXISTING_DOMAIN_HASH, ethers.ZeroAddress))
      .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
      .withArgs(owner.address, NON_EXISTING_DOMAIN_HASH);
    });

    it('It should revert with AccountIsNotEnsOwner if it is not the domain owner', async function () {
      const nonDomainOwner = addresses[0];
      await expect(ensRegistrar.registerDomain(nonDomainOwner, DOMAIN_HASH))
      .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
      .withArgs(nonDomainOwner.address, DOMAIN_HASH);

      await expect(ensRegistrar.connect(nonDomainOwner).registerDomainWithVerifier(
        DOMAIN_HASH, 
        ethers.ZeroAddress
      ))
      .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
      .withArgs(nonDomainOwner.address, DOMAIN_HASH);
    });

    it('It should register a domain if it is the domain owner', async function () {
      await ensRegistrar.registerDomain(owner, DOMAIN_HASH);
      
      expect(await registry.isDomainOwner(DOMAIN_HASH, owner)).to.be.true;
    });    
    
    it('It should register a domain with verifier if it is the domain owner', async function () {
      const verifier = addresses[0].address;
      
      await ensRegistrar.connect(owner).registerDomainWithVerifier(DOMAIN_HASH, verifier);
      
      expect(await registry.isDomainOwner(DOMAIN_HASH, owner)).to.be.true;
      expect(await registry.domainVerifier(DOMAIN_HASH)).to.equal(verifier);
    });
  });
});

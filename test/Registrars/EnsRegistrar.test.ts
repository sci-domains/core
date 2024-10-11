import { expect } from 'chai';
import { ethers, ignition } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { keccak256, namehash, toUtf8Bytes } from 'ethers';
import { EnsRegistrar, SciRegistry } from '../../types';
import {EnsRegistrarModule, EnsRegistrarModuleReturnType} from '../../ignition/modules/registrars/EnsRegistrarModule';

const NON_EXISTING_DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_HASH = '0xfcec0ff58c10be0e399a3a51186968513cc3a4c572a51d688ff338b3fbf6a7f9';

describe('EnsRegistrar', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let ensRegistrar: EnsRegistrar;
  let sciRegistry: SciRegistry;

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
    ({ ensRegistrar, sciRegistry } = await (ignition.deploy(
      EnsRegistrarModule,
      {
        parameters: {
          EnsRegistrar: {
            "ensRegistryAddress": ens.target as string,
          },
        },
      },
    ) as unknown as EnsRegistrarModuleReturnType));
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
      
      expect(await sciRegistry.isDomainOwner(DOMAIN_HASH, owner)).to.be.true;
    });    
    
    it('It should register a domain with verifier if it is the domain owner', async function () {
      const verifier = addresses[0].address;
      
      await ensRegistrar.connect(owner).registerDomainWithVerifier(DOMAIN_HASH, verifier);
      
      expect(await sciRegistry.isDomainOwner(DOMAIN_HASH, owner)).to.be.true;
      expect(await sciRegistry.domainVerifier(DOMAIN_HASH)).to.equal(verifier);
    });
  });
});

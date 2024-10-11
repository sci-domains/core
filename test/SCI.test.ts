import { expect } from 'chai';
import { ethers, ignition, upgrades } from 'hardhat';
import {
  PublicListVerifier,
  SciRegistry,
  SCI,
  Proxy
} from '../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { Block } from 'ethers';
import { PublicListVerifierModule, PublicListVerifierModuleReturnType } from '../ignition/modules/verifiers/PublicListVerifierModule';
import {SciModule, SciModuleReturnType} from '../ignition/modules/sci/SciModule';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import {SciUpgradeModule} from '../ignition/modules/sci/SciUpgradeModule';

const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const CHAIN = 1;

describe('SCI', function () {
  let owner: HardhatEthersSigner;
  let verifiedAccount: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sci: SCI;
  let proxy: Proxy;
  let sciRegistry: SciRegistry;
  let publicListVerifier: PublicListVerifier;
  let verififcationTime: number;
  let registrationBlock: Block;

  beforeEach(async () => {
    [owner, verifiedAccount, ...addresses] = await ethers.getSigners();

    ({ publicListVerifier, sciRegistry } = await (ignition.deploy(
      PublicListVerifierModule
    ) as unknown as PublicListVerifierModuleReturnType));

    ({ sci } = await (ignition.deploy(
      SciModule
    ) as unknown as SciModuleReturnType));

    // We need to set up this because the sci module deploys another 
    // registry for the tests
    sci.setRegistry(sciRegistry.target);
    sciRegistry.grantRole(await sciRegistry.REGISTRAR_ROLE(), owner);

    // Register domain with verifiers
    let tx = await sciRegistry.registerDomainWithVerifier(
      owner,
      DOMAIN_HASH,
      publicListVerifier.target,
    );
    // This will always return a block
    registrationBlock = (await tx.getBlock())!;

    // Register the account
    tx = await publicListVerifier.addAddresses(DOMAIN_HASH, [verifiedAccount.address], [[CHAIN]]);
    verififcationTime = (await tx.getBlock())!.timestamp;
  });

  describe('Initializable', function () {
    it('Should\'t be able to initialize a second time', async function () {
      await expect(sci.initialize(owner.address, sciRegistry.target)).to.revertedWithCustomError(sci, "InvalidInitialization");
    });
  });

  describe('Ownable', function () {
    it('Should set the right ownable in the deployment', async function () {
      expect(await sci.owner()).to.equal(owner.address);
    });
  });

  describe('Set Registry', function () {
    it('Only the owner is allow to set a new Registry', async function () {
      const notTheOwner = addresses[0];
      expect(await sci.owner()).to.not.equal(notTheOwner);

      const newRegistryAddress = addresses[1].address;
      expect(await sci.registry()).to.not.equal(newRegistryAddress);

      await expect(sci.connect(notTheOwner).setRegistry(newRegistryAddress))
        .to.revertedWithCustomError(sci, 'OwnableUnauthorizedAccount')
        .withArgs(notTheOwner.address);

      await sci.connect(owner).setRegistry(newRegistryAddress);
      expect(await sci.registry()).to.equal(newRegistryAddress);
    });

    it('Should emit RegistrySet when the registry is changed', async function () {
      const newRegistryAddress = addresses[1].address;
      await expect(sci.connect(owner).setRegistry(newRegistryAddress))
      .to.emit(sci, 'RegistrySet')
      .withArgs(sciRegistry.target, newRegistryAddress);
    });
  });

  describe('Verification', function () {
    it('Should return the verification time if the address if verified', async function () {
      expect(await sci.isVerifiedForDomainHash(DOMAIN_HASH, verifiedAccount.address, CHAIN)).to.be.equal(verififcationTime);
    });
    
    it('Should return 0 if the address if not verified', async function () {
      expect(await sci.isVerifiedForDomainHash(DOMAIN_HASH, addresses[0].address, CHAIN)).to.be.equal(0);
    });

    it('Should return accordingly when verifying multiple addresses', async function () {
      expect(await sci.isVerifiedForMultipleDomainHashes(
        [DOMAIN_HASH, ethers.ZeroHash], 
        verifiedAccount, 
        CHAIN)
      ).to.deep.equal([verififcationTime, 0])
    });
    
  });

  describe('Domain', function () {
    it('It should return the domain info for a registered domains', async function () {
      expect(await sci.domainHashToRecord(DOMAIN_HASH)).to.deep.equal([
        owner.address,
        publicListVerifier.target,
        registrationBlock.timestamp,
        registrationBlock.timestamp,
      ]);
    });
  });
});

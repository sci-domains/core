import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import {
  PublicListVerifier,
  Registry,
  SCI,
} from '../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('SCI', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sci: SCI;
  let registry: Registry;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const NameHashFactory = await ethers.getContractFactory('NameHash');
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory('Registry');
    registry = await RegistryFactory.deploy();

    await registry.grantRole(await registry.REGISTRAR_MANAGER_ROLE(), owner.address);
    registry.grantRole(await registry.REGISTRAR_ROLE(), owner);

    const PubicListVerifierFactory = await ethers.getContractFactory('PublicListVerifier');
    publicListverifier = await PubicListVerifierFactory.deploy(registry.target);

    const SCIFactory = await ethers.getContractFactory('SCI');
    sci = (await upgrades.deployProxy(
      SCIFactory,
      [owner.address, registry.target, nameHash.target],
      {
        initializer: 'initialize',
      },
    )) as unknown as SCI;
    await sci.waitForDeployment();
  });

  describe('Is Authorized', function () {
    it('It should return true if owner has the IS_AUTHORIZED role ', async function () {
      expect(
        await sci.isVerifiedForMultipleDomains(['secureci.xyz', 'otro.com'], registry.target, 1),
      ).to.deep.equal([false, false]);
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
  });

  describe('Domain info', function () {
    it('It should return the domain info for a registered domains', async function () {
      const domain = 'secureci.xyz';
      const domainNameHash = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
      const tx = await registry.registerDomainWithVerifier(
        owner,
        domainNameHash,
        publicListverifier.target,
      );
      const block = await tx.getBlock();
      expect(await sci.domainToRecord(domain)).to.deep.equal([
        owner.address,
        publicListverifier.target,
        block?.timestamp,
        block?.timestamp,
      ]);
    });
  });
});

import { ethers, ignition } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { PublicListVerifier, SciRegistry } from '../../types';
import { expect } from 'chai';
import { MaxUint256 } from 'ethers';
import {
  PublicListVerifierModule,
  PublicListVerifierModuleReturnType,
} from '../../ignition/modules/verifiers/PublicListVerifierModule';

const CHAIN_ID = 1;
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_WITH_WILDCARD_HASH =
  '0x1716343d0689cbd485fdf69796462e95bb6ff7a1249660b9fcf2fdd6c6c04f0e';

describe('Public List Verifier', function () {
  let owner: HardhatEthersSigner;
  let domainOwner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sciRegistry: SciRegistry;
  let publicListVerifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, domainOwner, ...addresses] = await ethers.getSigners();

    ({ publicListVerifier, sciRegistry } = await (ignition.deploy(
      PublicListVerifierModule,
    ) as unknown as PublicListVerifierModuleReturnType));

    sciRegistry.grantRole(await sciRegistry.REGISTRAR_ROLE(), owner.address);
    sciRegistry.grantRole(await sciRegistry.REGISTRAR_ROLE(), domainOwner.address);

    await sciRegistry.registerDomain(domainOwner, DOMAIN_HASH);
  });

  describe('Add Addresses', function () {
    it('Should let only the owner of the domain add addresses for the domain', async function () {
      const notOwner = addresses[0];
      const chainId = 1;
      await expect(
        publicListVerifier
          .connect(notOwner)
          .addAddresses(DOMAIN_HASH, [sciRegistry.target], [[chainId]]),
      )
        .revertedWithCustomError(sciRegistry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      const tx = await publicListVerifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [sciRegistry.target], [[chainId]]);
      expect(
        await publicListVerifier.verifiedContracts(DOMAIN_HASH, sciRegistry.target, CHAIN_ID),
      ).to.be.equal((await tx.getBlock())!.timestamp);
    });
  });

  describe('Remove Addresses', function () {
    it('Should let only the owner of the domain remove addresses for the domain', async function () {
      const notOwner = addresses[0];
      const chainId = 1;
      await publicListVerifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [sciRegistry.target], [[chainId]]);

      await expect(
        publicListVerifier
          .connect(notOwner)
          .removeAddresses(DOMAIN_HASH, [sciRegistry.target], [[chainId]]),
      )
        .revertedWithCustomError(sciRegistry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      await publicListVerifier
        .connect(domainOwner)
        .removeAddresses(DOMAIN_HASH, [sciRegistry.target], [[chainId]]);
      expect(
        await publicListVerifier.verifiedContracts(DOMAIN_HASH, sciRegistry.target, CHAIN_ID),
      ).to.be.equal(0);
    });
  });

  describe('Verify Address', function () {
    let verificationTime: number;
    beforeEach(async () => {
      const tx = await publicListVerifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [sciRegistry.target], [[1]]);
      verificationTime = (await tx.getBlock())!.timestamp;
    });

    it('Should return the verification time for a verified address', async function () {
      expect(
        await publicListVerifier.isVerified(DOMAIN_HASH, sciRegistry.target, CHAIN_ID),
      ).to.be.equal(verificationTime);
    });

    it('Should return the verification time for any chain if it is with the multi chain id', async function () {
      expect(
        await publicListVerifier.isVerified(DOMAIN_HASH, sciRegistry.target, CHAIN_ID + 1),
      ).to.be.equal(0);
      const tx = await publicListVerifier
        .connect(domainOwner)
        .addAddresses(DOMAIN_HASH, [sciRegistry.target], [[MaxUint256]]);
      expect(
        await publicListVerifier.isVerified(DOMAIN_HASH, sciRegistry.target, CHAIN_ID + 1),
      ).to.be.equal((await tx.getBlock())!.timestamp);
    });

    it('Should return 0 for a verified address in a wrong chain', async function () {
      expect(
        await publicListVerifier.isVerified(DOMAIN_HASH, sciRegistry.target, CHAIN_ID + 1),
      ).to.be.equal(0);
    });

    it('Should return 0 for an unverified address', async function () {
      expect(
        await publicListVerifier.isVerified(DOMAIN_HASH, publicListVerifier.target, CHAIN_ID),
      ).to.be.equal(0);
    });

    it('Should return 0 for an unregistered domain', async function () {
      expect(
        await publicListVerifier.isVerified(
          DOMAIN_WITH_WILDCARD_HASH,
          sciRegistry.target,
          CHAIN_ID,
        ),
      ).to.be.equal(0);
    });
  });
});

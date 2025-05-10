import { ethers, ignition } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ExplorerVerifier, PublicListVerifier, SciRegistry } from '../../types';
import { expect } from 'chai';
import ExplorerVerifierModule, {
  ExplorerVerifierModuleReturnType,
} from '../../ignition/modules/verifiers/ExplorerVerifierModule';

const CHAIN_ID = 1;
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_WITH_WILDCARD_HASH =
  '0x1716343d0689cbd485fdf69796462e95bb6ff7a1249660b9fcf2fdd6c6c04f0e';

describe('Explorer Verifier', function () {
  let owner: HardhatEthersSigner;
  let domainOwner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sciRegistry: SciRegistry;
  let explorerVerifier: ExplorerVerifier;

  beforeEach(async () => {
    [owner, domainOwner, ...addresses] = await ethers.getSigners();

    ({ explorerVerifier, sciRegistry } = await (ignition.deploy(ExplorerVerifierModule, {
      strategy: 'create2',
      strategyConfig: {
        salt: ethers.hexlify(ethers.randomBytes(32)),
      },
    }) as unknown as ExplorerVerifierModuleReturnType));

    sciRegistry.grantRole(await sciRegistry.REGISTRAR_ROLE(), owner.address);
    sciRegistry.grantRole(await sciRegistry.REGISTRAR_ROLE(), domainOwner.address);

    await sciRegistry.registerDomain(domainOwner, DOMAIN_HASH);
  });

  describe('Add Chains', function () {
    it('Should let only the owner of the domain add chains for the domain', async function () {
      const notOwner = addresses[0];
      const chainId = 1;
      await expect(explorerVerifier.connect(notOwner).addChains(DOMAIN_HASH, [chainId]))
        .revertedWithCustomError(sciRegistry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      const tx = await explorerVerifier.connect(domainOwner).addChains(DOMAIN_HASH, [chainId]);
      expect(
        await explorerVerifier.isVerified(DOMAIN_HASH, sciRegistry.target, CHAIN_ID),
      ).to.be.equal((await tx.getBlock())!.timestamp);
    });
  });

  describe('Remove Addresses', function () {
    it('Should let only the owner of the domain remove chains for the domain', async function () {
      const notOwner = addresses[0];
      const chainId = 1;
      await explorerVerifier.connect(domainOwner).removeChains(DOMAIN_HASH, [chainId]);

      await expect(explorerVerifier.connect(notOwner).removeChains(DOMAIN_HASH, [chainId]))
        .revertedWithCustomError(sciRegistry, 'AccountIsNotDomainOwner')
        .withArgs(notOwner.address, DOMAIN_HASH);

      await explorerVerifier.connect(domainOwner).removeChains(DOMAIN_HASH, [chainId]);
      expect(
        await explorerVerifier.isVerified(DOMAIN_HASH, sciRegistry.target, CHAIN_ID),
      ).to.be.equal(0);
    });
  });

  describe('Verify Address', function () {
    let verificationTime: number;
    let randomAddress: string;
    beforeEach(async () => {
      const tx = await explorerVerifier.connect(domainOwner).addChains(DOMAIN_HASH, [CHAIN_ID]);
      verificationTime = (await tx.getBlock())!.timestamp;
      randomAddress = ethers.hexlify(ethers.randomBytes(20));
    });

    it('Should return the verification time for an address in the verified chain', async function () {
      expect(await explorerVerifier.isVerified(DOMAIN_HASH, randomAddress, CHAIN_ID)).to.be.equal(
        verificationTime,
      );
    });

    it('Should return 0 for a chain that is not verified', async function () {
      expect(
        await explorerVerifier.isVerified(DOMAIN_HASH, randomAddress, CHAIN_ID + 1),
      ).to.be.equal(0);
    });

    it('Should return 0 for an unregistered domain', async function () {
      expect(
        await explorerVerifier.isVerified(DOMAIN_WITH_WILDCARD_HASH, randomAddress, CHAIN_ID),
      ).to.be.equal(0);
    });
  });
});

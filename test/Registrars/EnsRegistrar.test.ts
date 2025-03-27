import { MockCrossDomainMessanger } from './../../types/contracts/Op/mocks/MockCrossDomainMessanger';
import { expect } from 'chai';
import { ethers, ignition } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { keccak256, namehash, toUtf8Bytes } from 'ethers';
import { EnsRegistrar, SciRegistry } from '../../types';
import {
  EnsRegistrarModule,
  EnsRegistrarModuleReturnType,
} from '../../ignition/modules/registrars/EnsRegistrarModule';
import SciRegistrarModule, { SciRegistrarModuleReturnType } from '../../ignition/modules/registrars/SciRegistrarModule';

const NON_EXISTING_DOMAIN_HASH =
  '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_HASH = '0xfcec0ff58c10be0e399a3a51186968513cc3a4c572a51d688ff338b3fbf6a7f9';

describe('EnsRegistrar', function () {
  let owner: HardhatEthersSigner;
  let xDomainMessageSender: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let ensRegistrar: EnsRegistrar;
  let mockCrossDomainMessanger: MockCrossDomainMessanger;
  let sciRegistry: SciRegistry;

  beforeEach(async () => {
    [owner, xDomainMessageSender, ...addresses] = await ethers.getSigners();

    // ENS Contracts Deployment
    const EnsFactory = await ethers.getContractFactory('ENSRegistry');
    const ens = await EnsFactory.deploy();

    // ENS Contracts Deployment
    const MockCrossDomainMessangerFactory = await ethers.getContractFactory('MockCrossDomainMessanger');
    mockCrossDomainMessanger = await MockCrossDomainMessangerFactory.deploy(xDomainMessageSender, false);

    // Set ENS nodes for testing
    await ens.setSubnodeOwner(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      keccak256(toUtf8Bytes('eth')),
      owner.address,
    );
    await ens.setSubnodeOwner(namehash('eth'), keccak256(toUtf8Bytes('a')), owner.address);

    // SCI Contracts
    ({ sciRegistry } = await (ignition.deploy(SciRegistrarModule, {}) as unknown as SciRegistrarModuleReturnType));

    ({ ensRegistrar } = await (ignition.deploy(EnsRegistrarModule, {
      parameters: {
        EnsRegistrar: {
          ensRegistryAddress: ens.target as string,
          l1CrossDomainMessangerAddress: mockCrossDomainMessanger.target as string,
          sciRegistryAddress: sciRegistry.target as string,
        },
      },
    }) as unknown as EnsRegistrarModuleReturnType));
  });

  describe('ENS Domain', function () {
    it("It should revert with AccountIsNotEnsOwner if the domain hash doesn't exist in ENS", async function () {
      await expect(ensRegistrar.registerDomain(owner, NON_EXISTING_DOMAIN_HASH))
        .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
        .withArgs(owner.address, NON_EXISTING_DOMAIN_HASH);

      await expect(
        ensRegistrar.registerDomainWithVerifier(NON_EXISTING_DOMAIN_HASH, ethers.ZeroAddress),
      )
        .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
        .withArgs(owner.address, NON_EXISTING_DOMAIN_HASH);
    });

    it('It should revert with AccountIsNotEnsOwner if it is not the domain owner', async function () {
      const nonDomainOwner = addresses[0];
      await expect(ensRegistrar.registerDomain(nonDomainOwner, DOMAIN_HASH))
        .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
        .withArgs(nonDomainOwner.address, DOMAIN_HASH);

      await expect(
        ensRegistrar
          .connect(nonDomainOwner)
          .registerDomainWithVerifier(DOMAIN_HASH, ethers.ZeroAddress),
      )
        .to.revertedWithCustomError(ensRegistrar, 'AccountIsNotEnsOwner')
        .withArgs(nonDomainOwner.address, DOMAIN_HASH);
    });

    it('It should register a domain if it is the domain owner', async function () {
      await expect(ensRegistrar.registerDomain(owner, DOMAIN_HASH)).to.emit(
        mockCrossDomainMessanger, 
        'MessageSent'
      ).withArgs(
        sciRegistry.target,
        sciRegistry.interface.encodeFunctionData("registerDomain", [owner.address, DOMAIN_HASH]), 
        ensRegistrar.REGISTER_DOMAIN_GAS_LIMIT()
      );
    });

    it('It should register a domain with verifier if it is the domain owner', async function () {
      const verifier = addresses[0].address;
      await expect(ensRegistrar.connect(owner).registerDomainWithVerifier(DOMAIN_HASH, verifier)).to.emit(
        mockCrossDomainMessanger, 
        'MessageSent'
      ).withArgs(
        sciRegistry.target, 
        sciRegistry.interface.encodeFunctionData("registerDomainWithVerifier", [owner.address, DOMAIN_HASH, verifier]), 
        ensRegistrar.REGISTER_DOMAIN_WITH_VERIFIER_GAS_LIMIT()
      );
    });
  });
});

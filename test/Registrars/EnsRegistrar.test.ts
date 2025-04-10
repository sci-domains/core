import { MockCrossDomainMessenger } from '../../types';
import { expect } from 'chai';
import { ethers, ignition } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { keccak256, namehash, toUtf8Bytes } from 'ethers';
import { EnsRegistrar, SuperChainTargetRegistrar__factory } from '../../types';
import {
  EnsRegistrarModule,
  EnsRegistrarModuleReturnType,
} from '../../ignition/modules/registrars/EnsRegistrarModule';
import { SuperChainTargetRegistrarInterface } from '../../types/contracts/Registrars/SuperChainTargetRegistrar';

const NON_EXISTING_DOMAIN_HASH =
  '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_HASH = '0xfcec0ff58c10be0e399a3a51186968513cc3a4c572a51d688ff338b3fbf6a7f9';

describe('EnsRegistrar', function () {
  let owner: HardhatEthersSigner;
  let xDomainMessageSender: HardhatEthersSigner;
  let superChainTargetRegistrar: HardhatEthersSigner;
  let superChainTargetRegistrarInterface: SuperChainTargetRegistrarInterface;
  let addresses: HardhatEthersSigner[];
  let ensRegistrar: EnsRegistrar;
  let MockCrossDomainMessenger: MockCrossDomainMessenger;

  beforeEach(async () => {
    [owner, superChainTargetRegistrar, xDomainMessageSender, ...addresses] =
      await ethers.getSigners();

    // ENS Contracts Deployment
    const EnsFactory = await ethers.getContractFactory('ENSRegistry');
    const ens = await EnsFactory.deploy();

    // ENS Contracts Deployment
    const MockCrossDomainMessengerFactory = await ethers.getContractFactory(
      'MockCrossDomainMessenger',
    );
    MockCrossDomainMessenger = await MockCrossDomainMessengerFactory.deploy(
      xDomainMessageSender,
      false,
    );

    superChainTargetRegistrarInterface = SuperChainTargetRegistrar__factory.createInterface();

    // Set ENS nodes for testing
    await ens.setSubnodeOwner(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      keccak256(toUtf8Bytes('eth')),
      owner.address,
    );
    await ens.setSubnodeOwner(namehash('eth'), keccak256(toUtf8Bytes('a')), owner.address);

    ({ ensRegistrar } = await (ignition.deploy(EnsRegistrarModule, {
      parameters: {
        EnsRegistrar: {
          ensRegistryAddress: ens.target as string,
          l1CrossDomainMessangerAddress: MockCrossDomainMessenger.target as string,
          superChainTargetRegistrar: superChainTargetRegistrar.address,
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
      await expect(ensRegistrar.registerDomain(owner, DOMAIN_HASH))
        .to.emit(MockCrossDomainMessenger, 'MessageSent')
        .withArgs(
          superChainTargetRegistrar.address,
          superChainTargetRegistrarInterface.encodeFunctionData('registerDomain', [
            owner.address,
            DOMAIN_HASH,
          ]),
          ensRegistrar.REGISTER_DOMAIN_GAS_LIMIT(),
        );
    });

    it('It should register a domain with verifier if it is the domain owner', async function () {
      const verifier = addresses[0].address;
      await expect(ensRegistrar.connect(owner).registerDomainWithVerifier(DOMAIN_HASH, verifier))
        .to.emit(MockCrossDomainMessenger, 'MessageSent')
        .withArgs(
          superChainTargetRegistrar.address,
          superChainTargetRegistrarInterface.encodeFunctionData('registerDomainWithVerifier', [
            owner.address,
            DOMAIN_HASH,
            verifier,
          ]),
          ensRegistrar.REGISTER_DOMAIN_WITH_VERIFIER_GAS_LIMIT(),
        );
    });
  });
});

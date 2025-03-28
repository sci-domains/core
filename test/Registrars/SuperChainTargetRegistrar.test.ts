import { expect } from 'chai';
import { ethers, ignition } from 'hardhat';
import { SuperChainTargetRegistrar, SciRegistry, MockCrossDomainMessanger } from '../../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import SuperChainTargetRegistrarModule, { SuperChainTargetRegistrarModuleReturnType } from '../../ignition/modules/registrars/SuperchainTargetRegistrarModule';
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';

const GAS_FOR_DOMAIN = 1000000;
const GAS_FOR_DOMAIN_AND_VERIFIER = 1500000;

describe('SuperChainTargetRegistrar', function () {
  let user: HardhatEthersSigner;
  let domainOwner: HardhatEthersSigner;
  let xDomainMessageSender: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let superChainTargetRegistrar: SuperChainTargetRegistrar;
  let sciRegistry: SciRegistry;
  let mockCrossDomainMessanger: MockCrossDomainMessanger;

  beforeEach(async () => {
    [user, domainOwner, xDomainMessageSender, ...addresses] = await ethers.getSigners();

    const MockCrossDomainMessangerFactory = await ethers.getContractFactory('MockCrossDomainMessanger');
    mockCrossDomainMessanger = await MockCrossDomainMessangerFactory.deploy(xDomainMessageSender, true);

    ({ superChainTargetRegistrar, sciRegistry } = await (ignition.deploy(
      SuperChainTargetRegistrarModule, {parameters: {
        SuperChainTargetRegistrar: {
          l2CrossDomainMessangerAddress: mockCrossDomainMessanger.target as string,
        },
      },}
    ) as unknown as SuperChainTargetRegistrarModuleReturnType));

    await superChainTargetRegistrar.grantRole(await superChainTargetRegistrar.REGISTER_DOMAIN_ROLE(), xDomainMessageSender.address);
  });

  describe('Register domains', function () {
    it('It should register a domain with verifier if it is called by the crossDomainMessanger and the xDomainMessageSender has the REGISTER_DOMAIN_ROLE role', async function () {
      const verifier = addresses[0].address;

      await mockCrossDomainMessanger.sendMessage(
        superChainTargetRegistrar.target, 
        superChainTargetRegistrar.interface.encodeFunctionData("registerDomainWithVerifier", [domainOwner.address, DOMAIN_HASH, verifier]), 
        GAS_FOR_DOMAIN
      );

      expect(await sciRegistry.isDomainOwner(DOMAIN_HASH, domainOwner.address)).to.be.true;
      expect(await sciRegistry.domainVerifier(DOMAIN_HASH)).to.equal(verifier);
    });

    it('It should register a domain if it has the REGISTER_DOMAIN_ROLE role', async function () {
      await mockCrossDomainMessanger.sendMessage(
        superChainTargetRegistrar.target, 
        superChainTargetRegistrar.interface.encodeFunctionData("registerDomain", [domainOwner.address, DOMAIN_HASH]), 
        GAS_FOR_DOMAIN_AND_VERIFIER
      );

      expect(await sciRegistry.isDomainOwner(DOMAIN_HASH, domainOwner.address)).to.be.true;
    });

    it("It should reveret with AccessControlUnauthorizedAccount if it doesn't have the REGISTER_DOMAIN_ROLE role", async function () {
      await superChainTargetRegistrar.revokeRole(await superChainTargetRegistrar.REGISTER_DOMAIN_ROLE(), xDomainMessageSender.address);
      
      await expect(mockCrossDomainMessanger.sendMessage(
        superChainTargetRegistrar.target, 
        superChainTargetRegistrar.interface.encodeFunctionData("registerDomain", [domainOwner.address, DOMAIN_HASH]),
        GAS_FOR_DOMAIN 
      ))
        .to.revertedWithCustomError(superChainTargetRegistrar, 'AccessControlUnauthorizedAccount')
        .withArgs(xDomainMessageSender.address, await superChainTargetRegistrar.REGISTER_DOMAIN_ROLE());

      await expect(mockCrossDomainMessanger.sendMessage(
        superChainTargetRegistrar.target, 
        superChainTargetRegistrar.interface.encodeFunctionData("registerDomainWithVerifier", [domainOwner.address, DOMAIN_HASH, ethers.ZeroAddress]),
        GAS_FOR_DOMAIN 
      ))
        .to.revertedWithCustomError(superChainTargetRegistrar, 'AccessControlUnauthorizedAccount')
        .withArgs(xDomainMessageSender.address, await superChainTargetRegistrar.REGISTER_DOMAIN_ROLE());
    });

    it("It should reveret with InvalidMessageSender if the message sender is not the CrossDomainMessanger", async function () {   
      await expect(superChainTargetRegistrar.connect(user).registerDomain(domainOwner.address, DOMAIN_HASH))
        .to.revertedWithCustomError(superChainTargetRegistrar, 'InvalidMessageSender')
        .withArgs(user.address);

      await expect(superChainTargetRegistrar.connect(user).registerDomainWithVerifier(domainOwner.address, DOMAIN_HASH, ethers.ZeroAddress))
        .to.revertedWithCustomError(superChainTargetRegistrar, 'InvalidMessageSender')
        .withArgs(user.address);
    });
  });
});

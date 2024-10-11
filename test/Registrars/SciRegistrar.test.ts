import { expect } from 'chai';
import { ethers, ignition } from 'hardhat';
import { SciRegistrar, SciRegistry } from '../../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { SciRegistrarModule, SciRegistrarModuleReturnType } from '../../ignition/modules/registrars/SciRegistrarModule';
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';

describe('SciRegistrar', function () {
  let user: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sciRegistrar: SciRegistrar;
  let sciRegistry: SciRegistry;

  beforeEach(async () => {
    [user, ...addresses] = await ethers.getSigners();

    ({ sciRegistrar, sciRegistry } = await (ignition.deploy(
      SciRegistrarModule
    ) as unknown as SciRegistrarModuleReturnType));
  });

  describe('Register domains', function () {
    it('It should register a domain with verifier if it has the REGISTER_DOMAIN_ROLE role', async function () {
      const verifier = addresses[0].address;
      const domainOwner = addresses[1].address;

      await sciRegistrar.connect(user).registerDomainWithVerifier(domainOwner, DOMAIN_HASH, verifier);
      
    });

    it('It should register a domain if it if it has the REGISTER_DOMAIN_ROLE role', async function () {
      await sciRegistrar.registerDomain(user, DOMAIN_HASH);
      
      expect(await sciRegistry.isDomainOwner(DOMAIN_HASH, user)).to.be.true;
    });    

    it("It should reveret with AccessControlUnauthorizedAccount if it doesn't have the REGISTER_DOMAIN_ROLE role", async function () {
      await sciRegistrar.revokeRole(await sciRegistrar.REGISTER_DOMAIN_ROLE(), user.address);
      await expect(sciRegistrar.registerDomain(user, DOMAIN_HASH))
      .to.revertedWithCustomError(sciRegistrar, 'AccessControlUnauthorizedAccount')
      .withArgs(user.address, await sciRegistrar.REGISTER_DOMAIN_ROLE());

      await expect(sciRegistrar.registerDomainWithVerifier(user, DOMAIN_HASH, ethers.ZeroAddress))
      .to.revertedWithCustomError(sciRegistrar, 'AccessControlUnauthorizedAccount')
      .withArgs(user.address, await sciRegistrar.REGISTER_DOMAIN_ROLE());
    });
  });
});

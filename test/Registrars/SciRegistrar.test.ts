import { expect } from 'chai';
import { ethers, ignition } from 'hardhat';
import { SciRegistrar, SciRegistry } from '../../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import {
  SciRegistrarModule,
  SciRegistrarModuleReturnType,
} from '../../ignition/modules/registrars/SciRegistrarModule';
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';

describe('SciRegistrar', function () {
  let user: HardhatEthersSigner;
  let domainOwner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sciRegistrar: SciRegistrar;
  let sciRegistry: SciRegistry;

  beforeEach(async () => {
    [user, domainOwner, ...addresses] = await ethers.getSigners();

    ({ sciRegistrar, sciRegistry } = await (ignition.deploy(
      SciRegistrarModule,
    ) as unknown as SciRegistrarModuleReturnType));
  });

  describe('Register domains', function () {
    it('It should register a domain with verifier if it has the REGISTER_DOMAIN_ROLE role', async function () {
      const verifier = addresses[0].address;

      await sciRegistrar
        .connect(user)
        .registerDomainWithVerifier(domainOwner.address, DOMAIN_HASH, verifier);

      expect(await sciRegistry.isDomainOwner(DOMAIN_HASH, domainOwner.address)).to.be.true;
      expect(await sciRegistry.domainVerifier(DOMAIN_HASH)).to.equal(verifier);
    });

    it('It should register a domain if it has the REGISTER_DOMAIN_ROLE role', async function () {
      await sciRegistrar.connect(user).registerDomain(domainOwner.address, DOMAIN_HASH);

      expect(await sciRegistry.isDomainOwner(DOMAIN_HASH, domainOwner.address)).to.be.true;
    });

    it("It should reveret with AccessControlUnauthorizedAccount if it doesn't have the REGISTER_DOMAIN_ROLE role", async function () {
      await sciRegistrar.revokeRole(await sciRegistrar.REGISTER_DOMAIN_ROLE(), user.address);

      await expect(sciRegistrar.connect(user).registerDomain(domainOwner.address, DOMAIN_HASH))
        .to.revertedWithCustomError(sciRegistrar, 'AccessControlUnauthorizedAccount')
        .withArgs(user.address, await sciRegistrar.REGISTER_DOMAIN_ROLE());

      await expect(
        sciRegistrar.registerDomainWithVerifier(
          domainOwner.address,
          DOMAIN_HASH,
          ethers.ZeroAddress,
        ),
      )
        .to.revertedWithCustomError(sciRegistrar, 'AccessControlUnauthorizedAccount')
        .withArgs(user.address, await sciRegistrar.REGISTER_DOMAIN_ROLE());
    });
  });
});

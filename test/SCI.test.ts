import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import {
  AlwaysFalseAuthorizer,
  AlwaysTrueAuthorizer,
  PublicListVerifier,
  Registry,
  SCI,
} from '../types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ADD_AUTHORIZER_ROLE, ADD_TRUSTED_VERIFIER_ROLE } from '../utils/roles';

const ALWAYS_TRUE_AUTHORIZER_ID = 1;
const ALWAYS_FALSE_AUTHORIZER_ID = 2;

describe('SCI', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sci: SCI;
  let registry: Registry;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let alwaysFalseAuthorizer: AlwaysFalseAuthorizer;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const NameHashFactory = await ethers.getContractFactory('NameHash');
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory('Registry');
    registry = await RegistryFactory.deploy(await nameHash.getAddress());
    await registry.grantRole(ADD_AUTHORIZER_ROLE, owner.address);
    await registry.grantRole(ADD_TRUSTED_VERIFIER_ROLE, owner.address);

    const AlwaysTrueAuthorizer = await ethers.getContractFactory('AlwaysTrueAuthorizer');
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await registry.setAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer);

    const AlwaysFalseAuthorizer = await ethers.getContractFactory('AlwaysFalseAuthorizer');
    alwaysFalseAuthorizer = await AlwaysFalseAuthorizer.deploy();
    await registry.setAuthorizer(ALWAYS_FALSE_AUTHORIZER_ID, alwaysFalseAuthorizer);

    const PubicListVerifierFactory = await ethers.getContractFactory('PublicListVerifier');
    publicListverifier = await PubicListVerifierFactory.deploy(registry.target);

    const SCIFactory = await ethers.getContractFactory('SCI');
    sci = (await upgrades.deployProxy(SCIFactory, [registry.target, nameHash.target], {
      initializer: 'initialize',
    })) as unknown as SCI;
    await sci.waitForDeployment();
  });

  describe('Is Authorized', function () {
    it('It should return true if owner has the IS_AUTHORIZED role ', async function () {
      expect(
        await sci.isVerifiedForMultipleDomains(['secureci.xyz', 'otro.com'], registry.target, 1),
      ).to.deep.equal([false, false]);
    });
  });
});

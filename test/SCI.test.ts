import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import {
  AlwaysFalseAuthorizer,
  AlwaysTrueAuthorizer,
  PublicListVerifier,
  RegistryV0,
  SCI,
} from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ADD_AUTHORIZER_ROLE, ADD_TRUSTED_VERIFIER_ROLE, IS_AUTHORIZED } from '../utils/roles';
import { Contract } from 'ethers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ALWAYS_TRUE_AUTHORIZER_ID = 1;
const ALWAYS_FALSE_AUTHORIZER_ID = 2;
const DOMAIN = 'secureci.xyz';
const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const DOMAIN_WITH_WILDCARD_HASH =
  '0x1716343d0689cbd485fdf69796462e95bb6ff7a1249660b9fcf2fdd6c6c04f0e';

describe('SCI', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let sci: SCI;
  let registry: RegistryV0;
  let alwaysTrueAuthorizer: AlwaysTrueAuthorizer;
  let alwaysFalseAuthorizer: AlwaysFalseAuthorizer;
  let publicListverifier: PublicListVerifier;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const NameHashFactory = await ethers.getContractFactory('NameHash');
    const nameHash = await NameHashFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory('RegistryV0');
    registry = await RegistryFactory.deploy(await nameHash.getAddress());
    await registry.grantRole(ADD_AUTHORIZER_ROLE, owner.address);
    await registry.grantRole(ADD_TRUSTED_VERIFIER_ROLE, owner.address);

    const AlwaysTrueAuthorizer = await ethers.getContractFactory('AlwaysTrueAuthorizer');
    alwaysTrueAuthorizer = await AlwaysTrueAuthorizer.deploy();
    await registry.addAuthorizer(ALWAYS_TRUE_AUTHORIZER_ID, alwaysTrueAuthorizer);

    const AlwaysFalseAuthorizer = await ethers.getContractFactory('AlwaysFalseAuthorizer');
    alwaysFalseAuthorizer = await AlwaysFalseAuthorizer.deploy();
    await registry.addAuthorizer(ALWAYS_FALSE_AUTHORIZER_ID, alwaysFalseAuthorizer);

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
        await sci.isVerifiedForMultipleDomains(['secureci.xyz', 'otro.com'], 1, registry.target),
      ).to.deep.equal([false, false]);
    });
  });
});

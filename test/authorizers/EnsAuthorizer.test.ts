import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ENSAuthorizer, ENSRegistry } from '../../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { keccak256, namehash, toUtf8Bytes } from 'ethers';

const DOMAIN_HASH = '0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15';
const OTHER_DOMAIN_HASH = '0xfcec0ff58c10be0e399a3a51186968513cc3a4c572a51d688ff338b3fbf6a7f9';

describe('EnsAuthorizer', function () {
  let owner: HardhatEthersSigner;
  let addresses: HardhatEthersSigner[];
  let ensAuthorizer: ENSAuthorizer;

  beforeEach(async () => {
    [owner, ...addresses] = await ethers.getSigners();

    const EnsFactory = await ethers.getContractFactory('ENSRegistry');
    const ens = await EnsFactory.deploy();
    // Ens Authorization Contract Deployment
    const EnsAuthorizer = await ethers.getContractFactory('ENSAuthorizer');
    await ens.setSubnodeOwner(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      keccak256(toUtf8Bytes('eth')),
      owner.address,
    );
    await ens.setSubnodeOwner(namehash('eth'), keccak256(toUtf8Bytes('a')), owner.address);
    ensAuthorizer = await EnsAuthorizer.deploy(ens.target);
  });

  describe('ENS Domain', function () {
    it("It should return false if the domain hash doesn't exist in ENS", async function () {
      expect(await ensAuthorizer.isAuthorized(owner, DOMAIN_HASH)).to.false;
    });

    it('It should return false if it is not the domain owner', async function () {
      expect(await ensAuthorizer.isAuthorized(addresses[0].address, OTHER_DOMAIN_HASH)).to.false;
    });

    it('It should return true if it is the domain owner', async function () {
      expect(await ensAuthorizer.isAuthorized(owner, OTHER_DOMAIN_HASH)).to.true;
    });
  });
});

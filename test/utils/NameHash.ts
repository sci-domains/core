import { ethers } from 'hardhat';
import { NameHash } from '../../typechain-types';
import { expect } from 'chai';

describe('RegistryV0', function () {
  let nameHash: NameHash;

  beforeEach(async () => {
    const NameHashFactory = await ethers.getContractFactory('NameHash');
    nameHash = await NameHashFactory.deploy();
  });

  it('Should calculate the hash of a domain correctly', async function () {
    expect(await nameHash.getDomainHash('domain.com')).to.equal(
      '0xea283d6b921e8f457d6a4673799e5b28cdaaadd42fe38ea8146303877d9c2d41',
    );
  });

  it('Should calculate the hash of a subdomain correctly', async function () {
    expect(await nameHash.getDomainHash('subdomain.domain.com')).to.equal(
      '0x39a4b9e7030e220d2f86efb55497fb49d496bebd3693eb68faeca477ace716e9',
    );
  });
});

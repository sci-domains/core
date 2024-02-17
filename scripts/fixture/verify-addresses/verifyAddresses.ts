import { ethers } from 'hardhat';
import {
  NameHash__factory,
  PublicListVerifier__factory,
  Registry__factory,
  SCIAuthorizer__factory,
} from '../../../typechain-types';
import { ADD_AUTHORIZER_ROLE } from '../../../utils/roles';
import { ADDRESS_TO_VERIFY } from './addresses';

const VERIFIER_ADDRESS = '0x5dc4f8ef72A1Fb778443372bBA530740cEb84b7f';
const REGISTRY_ADDRESS = '0x9Fb83e16dC918CaFC1e57EC77Dd643A95f065a35';
const SCI_AUTHORIZER_ADDRESS = '0xe1da59CB197D6944ABDfC6D37CbDd20FaD567dc7';
const NAME_HASH_ADDRESS = '0x65fc5b21BDd27726510F554b62E60e3cAA9B2C9A';
async function main() {
  const owner = (await ethers.getSigners())[0];
  console.log(owner.address);
  const publicListVerifier = PublicListVerifier__factory.connect(VERIFIER_ADDRESS, owner);
  const sciAuthorizer = SCIAuthorizer__factory.connect(SCI_AUTHORIZER_ADDRESS, owner);
  const registry = Registry__factory.connect(REGISTRY_ADDRESS, owner);
  const nameHash = NameHash__factory.connect(NAME_HASH_ADDRESS, owner);

  // Add the pk as domain owner
  if (!(await sciAuthorizer.hasRole(ADD_AUTHORIZER_ROLE, owner.address))) {
    await sciAuthorizer.grantRole(ADD_AUTHORIZER_ROLE, owner.address);
  }

  const addressEntries = Object.entries(ADDRESS_TO_VERIFY);

  for (let i = 0; i < addressEntries.length; i++) {
    const [domain, contracts] = addressEntries[i];

    const domainHash = await nameHash.getDomainHash(domain);

    let tx;

    if (!(await registry.isDomainOwner(domainHash, owner.address))) {
      tx = await registry.registerDomainWithVerifier(1, domain, false, VERIFIER_ADDRESS);
      await tx.wait(1);
    }

    tx = await publicListVerifier.addAddresses(
      domainHash,
      Object.keys(contracts),
      Object.values(contracts),
    );
    await tx.wait(1);

    console.log(`Finish ${domain}`);
  }

  console.log(`Finish everything`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

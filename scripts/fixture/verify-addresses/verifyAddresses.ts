import { ethers } from 'hardhat';
import {
  NameHash__factory,
  PublicListVerifier__factory,
  Registry__factory,
  SCIAuthorizer__factory,
} from '../../../types';
import { ADD_AUTHORIZER_ROLE } from '../../../utils/roles';
import { ADDRESS_TO_VERIFY } from './addresses';
import { CONTRACT_NAMES, getDeployedContractAddress } from '../../utils';

async function main() {
  const registryAddress = await getDeployedContractAddress(CONTRACT_NAMES.REGISTRY);
  const verifierAddress = await getDeployedContractAddress(CONTRACT_NAMES.PUBLIC_LIST_VERIFIER);
  const sciAuthorizerAddress = await getDeployedContractAddress(CONTRACT_NAMES.SCI_AUTHORIZER);
  const nameHashAddress = await getDeployedContractAddress(CONTRACT_NAMES.NAME_HASH);

  const owner = await ethers.provider.getSigner();
  console.log(owner.address);
  const publicListVerifier = PublicListVerifier__factory.connect(verifierAddress, owner);
  const sciAuthorizer = SCIAuthorizer__factory.connect(sciAuthorizerAddress, owner);
  const registry = Registry__factory.connect(registryAddress, owner);
  const nameHash = NameHash__factory.connect(nameHashAddress, owner);

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
      tx = await registry.registerDomainWithVerifier(1, domain, false, verifierAddress);
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

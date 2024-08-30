import { ethers } from 'hardhat';
import {
  NameHash__factory,
  PublicListVerifier__factory,
  Registry__factory,
  SCIAuthorizer__factory,
} from '../../../types';
import { IS_AUTHORIZED } from '../../../utils/roles';
import { ADDRESS_TO_VERIFY } from './addresses';
import { CONTRACT_NAMES, getDeployedContractAddress, sendTransactionsViaSafe } from '../../utils';
import { ContractTransaction } from 'ethers';

async function main() {
  const registryAddress = await getDeployedContractAddress(CONTRACT_NAMES.REGISTRY);
  const verifierAddress = await getDeployedContractAddress(CONTRACT_NAMES.PUBLIC_LIST_VERIFIER);
  const sciAuthorizerAddress = await getDeployedContractAddress(CONTRACT_NAMES.SCI_AUTHORIZER);
  const nameHashAddress = await getDeployedContractAddress(CONTRACT_NAMES.NAME_HASH);

  const safeAddress = process.env.SAFE_ADDRESS!;
  const owner = await ethers.provider.getSigner();
  const publicListVerifier = PublicListVerifier__factory.connect(verifierAddress, owner);
  const sciAuthorizer = SCIAuthorizer__factory.connect(sciAuthorizerAddress, owner);
  const registry = Registry__factory.connect(registryAddress, owner);
  const nameHash = NameHash__factory.connect(nameHashAddress, owner);

  const txs: ContractTransaction[] = [];

  // Add the pk as domain owner
  if (!(await sciAuthorizer.hasRole(IS_AUTHORIZED, safeAddress))) {
    txs.push(await sciAuthorizer.grantRole.populateTransaction(IS_AUTHORIZED, safeAddress));
  }

  const addressEntries = Object.entries(ADDRESS_TO_VERIFY);
  for (let i = 0; i < addressEntries.length; i++) {
    const [domain, contracts] = addressEntries[i];
    const domainHash = await nameHash.getDomainHash(domain);

    if (!(await registry.isDomainOwner(domainHash, safeAddress))) {
      txs.push(
        await registry.registerDomainWithVerifier.populateTransaction(
          1,
          domain,
          false,
          verifierAddress,
        ),
      );
    }

    txs.push(
      await publicListVerifier.addAddresses.populateTransaction(
        domainHash,
        Object.keys(contracts),
        Object.values(contracts),
      ),
    );

    console.log(`Finish ${domain}`);
  }

  await sendTransactionsViaSafe(txs, safeAddress);

  console.log(`Finish everything`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .then(() => process.exit());

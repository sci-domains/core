import {ethers} from 'hardhat';
import { ADDRESS_TO_VERIFY } from './addresses';
import {getDeployedContractAddress, sendTransactionsViaSafe} from '../../utils';
import { ContractTransaction } from 'ethers';
import { namehash } from '@ensdomains/ensjs/utils';
import {PublicListVerifier__factory, SciRegistrar__factory, SciRegistry__factory} from "../../../types";

async function main() {
  const safeAddress = process.env.SAFE_ADDRESS!;
  const owner = await ethers.provider.getSigner();
  const deployedAddresses = await getDeployedContractAddress();

  const publicListVerifier = PublicListVerifier__factory.connect(deployedAddresses["PublicListVerifier#PublicListVerifier"], owner);
  const sciRegistrar = SciRegistrar__factory.connect(deployedAddresses["SciRegstrar#SciRegistrar"], owner);
  const sciRegistry = SciRegistry__factory.connect(deployedAddresses["SciRegistry#SciRegistry"], owner);

  const txs: ContractTransaction[] = [];

  // Add the pk as domain owner
  if (!(await sciRegistrar.hasRole(await sciRegistrar.REGISTER_DOMAIN_ROLE(), safeAddress))) {
    txs.push(
        await sciRegistrar.grantRole.populateTransaction(
            await sciRegistrar.REGISTER_DOMAIN_ROLE(),
            safeAddress
        )
    );
  }

  const addressEntries = Object.entries(ADDRESS_TO_VERIFY);
  for (let i = 0; i < addressEntries.length; i++) {
    const [domain, contracts] = addressEntries[i];
    const domainHash = namehash(domain);

    if (!(await sciRegistry.isDomainOwner(domainHash, safeAddress))) {
      txs.push(
        await sciRegistrar.registerDomainWithVerifier.populateTransaction(
          safeAddress,
          domainHash,
          publicListVerifier.target,
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

    console.log(`Finish ${domainHash}`);
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

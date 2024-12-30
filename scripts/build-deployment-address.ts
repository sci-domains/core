import { readJson, writeFile, readdir } from 'fs-extra';
import path from 'path';

const EXCLUDE_CHAINS = ['31337'];

async function main() {
  try {
    const deploymentsDir = path.join(__dirname, '..', 'ignition', 'deployments');
    const files = await readdir(deploymentsDir);

    // Filter for directories matching "chain-<chain number>"
    const validChains = files
      .filter((file) => /^chain-\d+$/.test(file)) // Matches "chain-<number>"
      .map((file) => file.split('-')[1]) // Extract the chain number
      .filter((chain) => !EXCLUDE_CHAINS.includes(chain)); // Exclude chains

    const outputData: { [key: string]: Object } = {};

    for (const chain of validChains) {
      const deployedAddressesPath = path.join(
        deploymentsDir,
        `chain-${chain}`,
        'deployed_addresses.json',
      );

      try {
        outputData[chain] = await readJson(deployedAddressesPath);
      } catch (error) {
        console.warn(`Skipping chain-${chain}: Failed to read deployed_addresses.json.`);
      }
    }

    // Convert the output data into a TypeScript file
    const tsContent = `type DeploymentKeys =
| 'ProxyModule#SCI'
| 'SciRegistry#SciRegistry'
| 'EnsRegistrar#EnsRegistrar'
| 'PublicListVerifier#PublicListVerifier'
| 'ProxyModule#TransparentUpgradeableProxy'
| 'ProxyModule#ProxyAdmin'
| 'SciModule#SCI'
| 'SciRegstrar#SciRegistrar';

export const deployments: { [key: string]: { [key: DeploymentKeys]: string } } = ${JSON.stringify(
      outputData,
      null,
      2,
    )
      .replace(/"/g, "'")
      .replace(/(?<=['}\]]),?\n/g, ',\n')};\n`;

    // Write the TypeScript file
    await writeFile('deployments.ts', tsContent);
    console.log('Created deployments.ts');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

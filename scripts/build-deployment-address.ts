import { readJson, writeJson, readdir } from 'fs-extra';
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

    const outputJson: { [key: string]: Object } = {};

    for (const chain of validChains) {
      const deployedAddressesPath = path.join(
        deploymentsDir,
        `chain-${chain}`,
        'deployed_addresses.json',
      );

      try {
        outputJson[chain] = await readJson(deployedAddressesPath);
      } catch (error) {
        console.warn(`Skipping chain-${chain}: Failed to read deployed_addresses.json.`);
      }
    }

    await writeJson('deployments.json', outputJson, { spaces: 2 });
    console.log(`Created`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

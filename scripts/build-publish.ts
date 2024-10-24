import { ensureDir, stat, copy, readJson, writeJson } from 'fs-extra';
import path from 'path';

const CHAINS = ['11155111'];
const PUBLISH_DIR = 'publish';
const BUILD_DIR = 'dist';
const TYPES_DIR = 'types';

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    // If the path doesn't exist, assume it's not a directory
    return false;
  }
}

async function publishDir(src: string[], dest: string[]): Promise<void> {
  const publishDir = path.join(__dirname, '..', PUBLISH_DIR, ...dest);
  if (await isDirectory(publishDir)) {
    await ensureDir(publishDir);
  }
  void copy(path.join(...src), publishDir);
}

async function main() {
  try {
    // Define paths
    const rootDir = path.join(__dirname, '..');

    void publishDir([rootDir, BUILD_DIR, TYPES_DIR], [TYPES_DIR]);
    console.log(`Moved types`);

    void publishDir([rootDir, 'README.md'], ['README.md']);
    console.log(`Moved Readme`);

    void publishDir([rootDir, 'artifacts'], ['artifacts']);
    console.log(`Moved artifacts`);

    void publishDir([rootDir, 'contracts'], ['contracts']);
    console.log(`Moved contracts`);

    void publishDir([rootDir, 'package.json'], ['package.json']);
    console.log(`Moved package.json`);

    void publishDir([rootDir, 'LICENSE.txt'], ['LICENSE.txt']);
    console.log(`Moved LICENSE.txt`);

    const outputJson: { [key: string]: Object } = {};
    const outputJsonPath = path.join(__dirname, '..', PUBLISH_DIR, 'addresses.json');
    for (const chain of CHAINS) {
      const deployedAddressesPath = path.join(
        __dirname,
        '..',
        'ignition',
        'deployments',
        `chain-${chain}`,
        'deployed_addresses.json',
      );
      // Read the deployed addresses JSON
      // Create new JSON structure with the chain ID
      outputJson[chain] = await readJson(deployedAddressesPath);
    }
    // Write the new JSON to publish directory
    await writeJson(outputJsonPath, outputJson, { spaces: 2 });
    console.log(`Created ${outputJsonPath}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Execute the script
main();

# Secure Contract Interaction V1 (SCI)

The Secure Contract Interaction (SCI) Protocol is an open-source initiative aimed at enhancing security within the web3 ecosystem. It introduces a decentralized verification system allowing domain owners to authorize specific smart contracts to interact with their domains, thus minimizing risks associated with malicious contracts.

## Features

- **Decentralized Verification:** Verify contracts authorized to interact with specific domains.
- **Flexibility:** Easily integrate into wallets, security apps, and on-chain contracts.
- **Open-Source:** Free to use and contribute to, promoting transparency and collaboration.
- **Enhanced Security:** Protect users from interacting with malicious smart contracts.

## Docs

For more information you can read the [Whitepaper](Whitepaper.pdf)

## Installation

### Prerequisites

- [NVM installed](https://github.com/nvm-sh/nvm)
- [pnpm package manager installed](https://pnpm.io/installation)

### Steps

1. Clone the repository:

```bash
git clone git@github.com:sci-domains/core.git
```

2. Navigate to the project directory:

```bash
cd core
```

3. Install and use node with nvm:

```bash
nvm install
nvm use
```

4. Install dependencies using Pnpm:

```bash
pnpm install
```

## Scripts

### Compile Solidity contracts:

```bash
pnpm compile
```

### Run tests:

```bash
pnpm test
```

### Deploy:

For the deployments we use hardhat ignition

```bash
pnpm deploy:<network>
```

To add a new chain you need to add a new configuration inside [parameters](ignition/parameters)
and add a new script in the package.json

You can deploy specific modules using hardhat ignition

After running the deployment, make sure to add the addresses to the deployments.ts file

```shell
pnpm save:deployments
```

### Publish:

We use [changesets](https://www.npmjs.com/package/@changesets/cli) to manage the versioning and publishing of the packages

First you need to create the changeset and then apply it

```bash
// Create a new changeset
pnpm changeset
// Apply the changeset
pnpm changeset version
```

After the PR with the changes is merge we create a release in GitHub and the workflow will publish the package

### Development:

You can execute the following commands to run a local node and deploy
the ENS Registry with the contracts from the protocol

```bash
pnpm node
// In another terminal
pnpm dev
```

## Contributing

Please see our contribution [guidelines](CONTRIBUTING.md).

## Maintainers

SCI is an open-source community project governed by a core team.

## License

This project is licensed under the [MIT License](LICENSE.txt).

import {ethers} from "hardhat";
import {keccak256, namehash, toUtf8Bytes} from "ethers";


async function main() {
    const [owner] = await ethers.getSigners();

    // ENS Contracts Deployment
    const EnsFactory = await ethers.getContractFactory('ENSRegistry');
    const ens = await EnsFactory.deploy();

    // Set ENS nodes for testing
    await ens.setSubnodeOwner(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        keccak256(toUtf8Bytes('eth')),
        owner.address,
    );
    await ens.setSubnodeOwner(namehash('eth'), keccak256(toUtf8Bytes('a')), owner.address);
    console.log("Deployed ENS to:", await ens.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .then(() => process.exit());

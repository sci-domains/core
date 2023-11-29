import { expect } from "chai";
import {ethers} from "hardhat";
import {
  ENSRegistry,
  ENSAuthorizer,
} from "../typechain-types";
const ensNamehash: any = require('@ensdomains/eth-ens-namehash');

const EMPTY_BYTES32 =
    '0x0000000000000000000000000000000000000000000000000000000000000000'
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
function sha3(name: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(name))
}

describe("EnsAuthorizer", function () {
  let ensRegistry: ENSRegistry, ensAuthorizer: ENSAuthorizer, rootDomain: string;

  beforeEach(async () => {
    // Ens Authorization Contract Deployment
    const EnsAuthorizer = await ethers.getContractFactory("ENSAuthorizer");
    ensAuthorizer = await EnsAuthorizer.deploy("0x8edc487D26F6c8Fa76e032066A3D4F87E273515d");
  })

  describe("ENS Domain", function () {
    it("It should calculate the ENS domain", async function () {

      //tried ethers.namehash, sha3 and all combinations nothing works, ayudame loco
      expect(await ensAuthorizer.getDomainHash("secureci.xyz")).to.equal(
          "0x77ebf9a801c579f50495cbb82e12145b476276f47b480b84c367a30b04d18e15"
      );
    });
  });
});

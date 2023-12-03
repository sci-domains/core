//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import './Authorizer.sol';
import '@ensdomains/ens-contracts/contracts/registry/ENS.sol';

contract ENSAuthorizer is Authorizer {
    // 365 days ~= one year
    uint256 constant ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

    ENS ensRegistry;

    constructor(address _ensRegistryAddress) {
        ensRegistry = ENS(_ensRegistryAddress);
    }

    function isAuthorize(address sender, string memory domain) external returns (uint256) {
        return hasENSDomain(domain, sender) ? block.timestamp + ONE_YEAR_IN_SECONDS : 0;
    }

    function hasENSDomain(string memory _name, address _address) public view returns (bool) {
        bytes32 node = getDomainHash(_name);
        address owner = ensRegistry.owner(node);
        return (owner == _address);
    }

    function getDomainHash(string memory domain) public pure returns (bytes32) {
        return namehash(abi.encodePacked(domain), 0);
    }

    function namehash(bytes memory domain, uint i) internal pure returns (bytes32) {
        if (domain.length <= i)
            return 0x0000000000000000000000000000000000000000000000000000000000000000;

        uint len = LabelLength(domain, i);

        return keccak256(abi.encodePacked(namehash(domain, i + len + 1), keccak(domain, i, len)));
    }

    function LabelLength(bytes memory domain, uint i) private pure returns (uint) {
        uint len;
        while (i + len != domain.length && domain[i + len] != 0x2e) {
            len++;
        }
        return len;
    }

    function keccak(bytes memory data, uint offset, uint len) private pure returns (bytes32 ret) {
        require(offset + len <= data.length);
        assembly {
            ret := keccak256(add(add(data, 32), offset), len)
        }
    }
}

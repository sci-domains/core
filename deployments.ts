type DeploymentKeys =
| 'ProxyModule#SCI'
| 'SciRegistry#SciRegistry'
| 'EnsRegistrar#EnsRegistrar'
| 'PublicListVerifier#PublicListVerifier'
| 'ProxyModule#TransparentUpgradeableProxy'
| 'ProxyModule#ProxyAdmin'
| 'SciModule#SCI'
| 'SciRegstrar#SciRegistrar';

export const deployments: { [key: string]: { [key: DeploymentKeys]: string } } = {
  '10': {
    'ProxyModule#SCI': '0xe324A37594561b3Bfe3f535Aa7108224a703710F',
    'SciRegistry#SciRegistry': '0xaDD75Aecd98f0ADAD899729c88BfED4f8951c02A',
    'EnsRegistrar#EnsRegistrar': '0xd58d48185146343720df2C26FcD8D3C3734e22cf',
    'PublicListVerifier#PublicListVerifier': '0x83223D23E769CFE4b8bec8A32Eb148d0dbEc4dE5',
    'ProxyModule#TransparentUpgradeableProxy': '0x5018467c486534Bd15dfE88694Cd0Cbb27A55663',
    'ProxyModule#ProxyAdmin': '0xc0f4550909FF46204CE857d6557edE3c115093C0',
    'SciModule#SCI': '0x5018467c486534Bd15dfE88694Cd0Cbb27A55663',
    'SciRegstrar#SciRegistrar': '0xC29e83AfEe01bDccA7f69fE1DfD7A61954dCE4d4',
  },
  '11155111': {
    'SciRegistry#SciRegistry': '0xaDD75Aecd98f0ADAD899729c88BfED4f8951c02A',
    'PublicListVerifier#PublicListVerifier': '0xd58d48185146343720df2C26FcD8D3C3734e22cf',
    'SciRegstrar#SciRegistrar': '0x83223D23E769CFE4b8bec8A32Eb148d0dbEc4dE5',
    'ProxyModule#SCI': '0xC29e83AfEe01bDccA7f69fE1DfD7A61954dCE4d4',
    'ProxyModule#TransparentUpgradeableProxy': '0x1694F779f28E3B3ff409d62c9d9d7042Ff406aEC',
    'ProxyModule#ProxyAdmin': '0x9007eD4FFa791BB63662D6E894A97e163e4C2A23',
    'SciModule#SCI': '0x1694F779f28E3B3ff409d62c9d9d7042Ff406aEC',
  },
};

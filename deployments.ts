type DeploymentKeys =
  | 'ProxyModule#SCI'
  | 'SciRegistry#SciRegistry'
  | 'EnsRegistrar#EnsRegistrar'
  | 'PublicListVerifier#PublicListVerifier'
  | 'ProxyModule#TransparentUpgradeableProxy'
  | 'ProxyModule#ProxyAdmin'
  | 'SciModule#SCI'
  | 'SciRegstrar#SciRegistrar';

export const deployments: { [key: string]: { [key in DeploymentKeys]: string } } = {
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
    'ProxyModule#SCI': '0x79A2C5A82E3d94513a0e9c3aC409a546D79b27b1',
    'SciRegistry#SciRegistry': '0xD84Dc714938fc3b7E9Ef2674f6cD3FdA49576FBf',
    'EnsRegistrar#EnsRegistrar': '0x9a33cD737a74939830e7a0bF6B3bFd67219d61E6',
    'PublicListVerifier#PublicListVerifier': '0x2E242894dC1580204037740f54984FA1d38931FD',
    'SciRegstrar#SciRegistrar': '0x64349bD9Ba62BaDCF92cAfbD08A337428360cE24',
    'ProxyModule#TransparentUpgradeableProxy': '0xE9debDF7E1223dAD6F2109F2A648DCCf050a56e0',
    'ProxyModule#ProxyAdmin': '0x4399350BBC86F1CB8F605cc6816507F96428656e',
    'SciModule#SCI': '0xE9debDF7E1223dAD6F2109F2A648DCCf050a56e0',
  },
};

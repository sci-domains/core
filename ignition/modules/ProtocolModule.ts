import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import sciRegistryModule from './registry/SciRegistryModule';
import superChainTargetRegistrarModule from './registrars/SuperchainTargetRegistrarModule';
import publicListVerifierModule from './verifiers/PublicListVerifierModule';
import sciModule from './sci/SciModule';
import sciRegistrarModule from './registrars/SciRegistrarModule';

export const ProtocolModule = buildModule('ProtocolModule', (m) => {
  m.useModule(sciRegistryModule);
  m.useModule(superChainTargetRegistrarModule);
  m.useModule(sciRegistrarModule);
  m.useModule(publicListVerifierModule);
  m.useModule(sciModule);
  return {};
});

export default ProtocolModule;

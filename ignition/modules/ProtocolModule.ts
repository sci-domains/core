import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import sciRegistryModule from './registry/SciRegistryModule';
import ensRegistrarModule from './registrars/EnsRegistrarModule';
import publicListVerifierModule from './verifiers/PublicListVerifierModule';
import sciModule from './sci/SciModule';
import sciRegistrarModule from "./registrars/SciRegistrarModule";

/**
 * This is the second module that will be run, and it is also the only module exported from this file.
 * It creates a contract instance for the Sci contract using the proxy from the previous module.
 */
export const ProtocolModule = buildModule('ProtocolModule', (m) => {
  m.useModule(sciRegistryModule);
  m.useModule(ensRegistrarModule);
  m.useModule(sciRegistrarModule);
  m.useModule(publicListVerifierModule);
  m.useModule(sciModule);
  return {};
});

export default ProtocolModule;

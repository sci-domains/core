import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { SciRegistry } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const SciRegistryModule = buildModule('SciRegistry', (m: IgnitionModuleBuilder) => {
  const sciRegistry = m.contract('SciRegistry', [0]);

  m.call(sciRegistry, 'grantRole', [
    m.staticCall(sciRegistry, 'REGISTRAR_MANAGER_ROLE'),
    m.getAccount(0),
  ]);

  return { sciRegistry };
});

export type SciRegistryModuleReturnType = Promise<{ sciRegistry: SciRegistry }>;

export default SciRegistryModule;

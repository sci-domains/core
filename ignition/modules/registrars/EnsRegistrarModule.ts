import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { SciRegistryModule } from '../registry/SciRegistryModule';
import { EnsRegistrar, SciRegistry } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const EnsRegistrarModule = buildModule('EnsRegistrar', (m: IgnitionModuleBuilder) => {
  const { sciRegistry } = m.useModule(SciRegistryModule);

  const ensRegistry = m.getParameter('ensRegistryAddress');

  const ensRegistrar = m.contract('EnsRegistrar', [ensRegistry, sciRegistry]);

  m.call(sciRegistry, 'grantRole', [m.staticCall(sciRegistry, 'REGISTRAR_ROLE'), ensRegistrar]);

  return { ensRegistrar, sciRegistry };
});

export type EnsRegistrarModuleReturnType = Promise<{
  ensRegistrar: EnsRegistrar;
  sciRegistry: SciRegistry;
}>;

export default EnsRegistrarModule;

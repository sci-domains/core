import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { SciRegistryModule } from '../registry/SciRegistryModule';
import { SciRegistrar, SciRegistry } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const SciRegistrarModule = buildModule('SciRegstrar', (m: IgnitionModuleBuilder) => {
  const { sciRegistry } = m.useModule(SciRegistryModule);

  const sciRegistrar = m.contract('SciRegistrar', [sciRegistry, 0]);

  m.call(sciRegistry, 'grantRole', [m.staticCall(sciRegistry, 'REGISTRAR_ROLE'), sciRegistrar]);

  m.call(sciRegistrar, 'grantRole', [
    m.staticCall(sciRegistrar, 'REGISTER_DOMAIN_ROLE'),
    m.getAccount(0),
  ]);

  return { sciRegistrar, sciRegistry };
});

export type SciRegistrarModuleReturnType = Promise<{
  sciRegistrar: SciRegistrar;
  sciRegistry: SciRegistry;
}>;

export default SciRegistrarModule;

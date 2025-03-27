import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { SciRegistryModule } from '../registry/SciRegistryModule';
import { EnsRegistrar, SciRegistry } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const SuperChainTargetRegistrarModule = buildModule('SuperChainTargetRegistrar', (m: IgnitionModuleBuilder) => {
  const { sciRegistry } = m.useModule(SciRegistryModule);

  const l2CrossDomainMessangerAddress = m.getParameter('l2CrossDomainMessangerAddress');

  const superChainTargetRegistrar = m.contract('SuperChainTargetRegistrar', [sciRegistry, l2CrossDomainMessangerAddress, 0]);

  m.call(sciRegistry, 'grantRole', [m.staticCall(sciRegistry, 'REGISTRAR_ROLE'), superChainTargetRegistrar]);

  return { superChainTargetRegistrar, sciRegistry };
});

export type EnsRegistrarModuleReturnType = Promise<{
  ensRegistrar: EnsRegistrar;
  sciRegistry: SciRegistry;
}>;

export default SuperChainTargetRegistrarModule;

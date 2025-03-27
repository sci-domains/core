import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { SciRegistryModule } from '../registry/SciRegistryModule';
import { EnsRegistrar, SciRegistry } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const EnsRegistrarModule = buildModule('EnsRegistrar', (m: IgnitionModuleBuilder) => {
  const ensRegistry = m.getParameter('ensRegistryAddress');
  const l1CrossDomainMessangerAddress = m.getParameter('l1CrossDomainMessangerAddress');
  const sciRegistryAddress = m.getParameter('sciRegistryAddress');

  const ensRegistrar = m.contract('EnsRegistrar', [ensRegistry, sciRegistryAddress, l1CrossDomainMessangerAddress]);

  return { ensRegistrar };
});

export type EnsRegistrarModuleReturnType = Promise<{
  ensRegistrar: EnsRegistrar;
}>;

export default EnsRegistrarModule;

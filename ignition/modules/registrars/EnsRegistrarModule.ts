import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { EnsRegistrar } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const EnsRegistrarModule = buildModule('EnsRegistrar', (m: IgnitionModuleBuilder) => {
  const ensRegistry = m.getParameter('ensRegistryAddress');
  const l1CrossDomainMessangerAddress = m.getParameter('l1CrossDomainMessangerAddress');
  const superChainTargetRegistrar = m.getParameter('superChainTargetRegistrar');

  const ensRegistrar = m.contract('EnsRegistrar', [
    ensRegistry,
    superChainTargetRegistrar,
    l1CrossDomainMessangerAddress,
  ]);

  return { ensRegistrar };
});

export type EnsRegistrarModuleReturnType = Promise<{
  ensRegistrar: EnsRegistrar;
}>;

export default EnsRegistrarModule;

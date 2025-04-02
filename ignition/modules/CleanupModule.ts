import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';
import SuperChainTargetRegistrarModule from './registrars/SuperChainTargetRegistrarModule';

export const CleanupModule = buildModule('CleanupModule', (m: IgnitionModuleBuilder) => {
  const { superChainTargetRegistrar } = m.useModule(SuperChainTargetRegistrarModule);

  m.call(superChainTargetRegistrar, 'grantRole', [
    m.staticCall(superChainTargetRegistrar, 'REGISTER_DOMAIN_ROLE'),
    m.getParameter('ensRegistrarAddress'),
  ]);

  return { superChainTargetRegistrar };
});

export default CleanupModule;

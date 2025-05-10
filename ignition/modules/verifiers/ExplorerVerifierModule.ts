import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

import { SciRegistryModule } from '../registry/SciRegistryModule';
import { ExplorerVerifier, SciRegistry } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const ExplorerVerifierModule = buildModule(
  'PublicListVerifier',
  (m: IgnitionModuleBuilder) => {
    const { sciRegistry } = m.useModule(SciRegistryModule);

    const explorerVerifier = m.contract('ExplorerVerifier', [sciRegistry]);

    return { explorerVerifier, sciRegistry };
  },
);

export type ExplorerVerifierModuleReturnType = Promise<{
  explorerVerifier: ExplorerVerifier;
  sciRegistry: SciRegistry;
}>;

export default ExplorerVerifierModule;

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

import { SciRegistryModule } from '../registry/SciRegistryModule';
import { PublicListVerifier, SciRegistry } from '../../../types';
import { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export const PublicListVerifierModule = buildModule(
  'PublicListVerifier',
  (m: IgnitionModuleBuilder) => {
    const { sciRegistry } = m.useModule(SciRegistryModule);

    const publicListVerifier = m.contract('PublicListVerifier', [sciRegistry]);

    return { publicListVerifier, sciRegistry };
  },
);

export type PublicListVerifierModuleReturnType = Promise<{
  publicListVerifier: PublicListVerifier;
  sciRegistry: SciRegistry;
}>;

export default PublicListVerifierModule;

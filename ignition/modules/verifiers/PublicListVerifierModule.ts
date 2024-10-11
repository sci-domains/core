import { PublicListVerifier } from './../../../types/contracts/Verifiers/PublicListVerifier';
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import {SciRegistryModule} from '../registry/SciRegistryModule';
import { SciRegistry } from '../../../types';

export const PublicListVerifierModule = buildModule("PublicListVerifier", (m) => {
  const { sciRegistry } = m.useModule(SciRegistryModule);

  const publicListVerifier = m.contract("PublicListVerifier", [sciRegistry]);

  return { publicListVerifier, sciRegistry };
});

export type PublicListVerifierModuleReturnType = Promise<{ publicListVerifier: PublicListVerifier, sciRegistry: SciRegistry }>;

export default PublicListVerifierModule;
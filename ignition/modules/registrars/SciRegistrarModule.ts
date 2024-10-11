import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { SciRegistryModule } from "../SciRegistryModule"
import { SciRegistrar, SciRegistry } from "../../../types";

export const SciRegistrarModule = buildModule("SciRegstrar", (m) => {
  const { sciRegistry } = m.useModule(SciRegistryModule);

  const sciRegistrar = m.contract("SciRegistrar", [sciRegistry, 0]);

  m.call(sciRegistry, "grantRole", [
    m.staticCall(sciRegistry, "REGISTRAR_ROLE"), 
    sciRegistrar
  ]);

  m.call(sciRegistrar, "grantRole", [
    m.staticCall(sciRegistrar, "REGISTER_DOMAIN_ROLE"), 
    m.getAccount(0)
  ]);

  return { sciRegistrar, sciRegistry };
});

export type SciRegistrarModuleReturnType = Promise<{ sciRegistrar: SciRegistrar, sciRegistry: SciRegistry }>;

export default SciRegistrarModule;
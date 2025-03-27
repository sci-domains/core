import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ensRegistrarModule from './registrars/EnsRegistrarModule';

export const SateliteModule = buildModule('SateliteModule', (m) => {
  m.useModule(ensRegistrarModule);
  return {};
});

export default SateliteModule;

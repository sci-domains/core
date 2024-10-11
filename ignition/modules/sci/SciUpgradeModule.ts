import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SciModule from "./SciModule";

const SCI_NEW_VERSION_CONTRACT_NAME = "SCI";

/**
 * This module upgrades the proxy to a new version of the Sci contract.
 */
const upgradeModule = buildModule("UpgradeModule", (m) => {
  // Make sure we're using the account that owns the ProxyAdmin contract.
  const proxyAdminOwner = m.getAccount(0);

  // Get the proxy and proxy admin from the previous module.
  const { proxyAdmin, proxy } = m.useModule(SciModule);

  // This is the new version of the Sci contract that we want to upgrade to.
  const sci = m.contract(SCI_NEW_VERSION_CONTRACT_NAME);

  // Upgrade the proxy to the new version of the Sci contract.
  // This function also accepts a data parameter, which accepts encoded function call data.
  // We pass the encoded function call data we created above to the `upgradeAndCall` function
  // so that the `setName` function is called on the new implementation contract after the upgrade.
  m.call(proxyAdmin, "upgradeAndCall", [proxy, sci, "0x"], {
    from: proxyAdminOwner,
  });

  // Return the proxy and proxy admin so that they can be used by other modules.
  return { proxyAdmin, proxy };
});

/**
 * This is the final module that will be run.
 *
 * It takes the proxy from the previous module and uses it to create a local contract instance
 * for the SCI contract. This allows us to interact with the SCI contract via the proxy.
 */
export const SciUpgradeModule = buildModule("SciUpgradeModule", (m) => {
  // Get the proxy from the previous module.
  const { proxy, proxyAdmin } = m.useModule(upgradeModule);

  // Create a local contract instance for the SCI contract.
  // This line tells Hardhat Ignition to use the SCI ABI for the contract at the proxy address.
  // This allows us to call functions on the SCI contract via the proxy.
  const sci = m.contractAt("SCI", proxy);

  // Return the contract instance so that it can be used by other modules or in tests.
  return { sci, proxy, proxyAdmin };
});

export default SciUpgradeModule;
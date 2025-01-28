export * from "./agent";

import type { SuiAgentKit } from "../agent";

import {
    SuiGetWalletAddressTool
} from "./index";

export function createSuiTools(suiAgentKit: SuiAgentKit) {
  return [
    new SuiGetWalletAddressTool(suiAgentKit),
  ];
}
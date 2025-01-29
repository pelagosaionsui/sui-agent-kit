export * from "./agent";
export * from "./sui";

import type { SuiAgentKit } from "../agent";

import {
    SuiGetWalletAddressTool,
    SuiGetBalanceTool,
} from "./index";

export function createSuiTools(suiAgentKit: SuiAgentKit) {
  return [
    new SuiGetWalletAddressTool(suiAgentKit),
    new SuiGetBalanceTool(suiAgentKit),
  ];
}
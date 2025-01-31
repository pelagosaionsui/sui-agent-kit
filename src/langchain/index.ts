export * from "./agent";
export * from "./sui";
export * from "./cetus";

import type { SuiAgentKit } from "../agent";

import {
    SuiGetWalletAddressTool,
    SuiGetBalanceTool,
    SuiTradeTool
} from "./index";

export function createSuiTools(suiAgentKit: SuiAgentKit) {
  return [
    new SuiGetWalletAddressTool(suiAgentKit),
    new SuiGetBalanceTool(suiAgentKit),
    new SuiTradeTool(suiAgentKit)
  ];
}
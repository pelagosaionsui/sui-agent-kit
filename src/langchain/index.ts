export * from "./agent";
export * from "./sui";
export * from "./cetus";
export * from "./navi";
export * from "./suilend";

import type { SuiAgentKit } from "../agent";

import {
    SuiGetWalletAddressTool,
    SuiGetBalanceTool,
    SuiCetusTradeTool,
    SuiTransferTool,
    SuiStakeTool,
    SuiNaviTradeTool,
    SuiSuilendDepositTool
} from "./index";

export function createSuiTools(suiAgentKit: SuiAgentKit) {
  return [
    new SuiGetWalletAddressTool(suiAgentKit),
    new SuiGetBalanceTool(suiAgentKit),
    new SuiCetusTradeTool(suiAgentKit),
    new SuiTransferTool(suiAgentKit),
    new SuiStakeTool(suiAgentKit),
    new SuiNaviTradeTool(suiAgentKit),
    new SuiSuilendDepositTool(suiAgentKit)
  ];
}
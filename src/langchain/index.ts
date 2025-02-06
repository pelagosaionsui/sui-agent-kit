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
    SuiSpringsuiStakeTool,
    SuiNaviTradeTool,
    SuiSuilendDepositTool,
    SuiSuilendBorrowTool,
    SuiSuilendWithdrawTool
} from "./index";

export function createSuiTools(suiAgentKit: SuiAgentKit) {
  return [
    new SuiGetWalletAddressTool(suiAgentKit),
    new SuiGetBalanceTool(suiAgentKit),
    new SuiCetusTradeTool(suiAgentKit),
    new SuiTransferTool(suiAgentKit),
    new SuiSpringsuiStakeTool(suiAgentKit),
    new SuiNaviTradeTool(suiAgentKit),
    new SuiSuilendDepositTool(suiAgentKit),
    new SuiSuilendBorrowTool(suiAgentKit),
    new SuiSuilendWithdrawTool(suiAgentKit),
  ];
}
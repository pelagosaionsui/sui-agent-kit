export * from './agent';
export * from './sui';
export * from './cetus';
export * from './navi';
export * from './suilend';
export * from './descreener';
export * from './pyth';
import type { SuiAgentKit } from '../agent';
import { SuiSetWalletAddressTool } from './agent';

import {
  SuiGetWalletAddressTool,
  SuiGetBalanceTool,
  SuiCetusTradeTool,
  SuiTransferTool,
  SuiSpringsuiStakeTool,
  SuiSpringsuiUnstakeTool,
  SuiNaviTradeTool,
  SuiSuilendDepositTool,
  SuiSuilendBorrowTool,
  SuiSuilendWithdrawTool,
  SuiSuilendRepayTool,
  DescreenerTokenDataByAddressTool,
  DescreenerTokenDataByTickerTool,
  PythPriceTool,
  PythEMAPriceTool,
} from './index';

export function createSuiTools(suiAgentKit: SuiAgentKit) {
  return [
    new SuiGetWalletAddressTool(suiAgentKit),
    new SuiSetWalletAddressTool(suiAgentKit),
    new SuiGetBalanceTool(suiAgentKit),
    new SuiCetusTradeTool(suiAgentKit),
    new SuiTransferTool(suiAgentKit),
    new SuiSpringsuiStakeTool(suiAgentKit),
    new SuiSpringsuiUnstakeTool(suiAgentKit),
    new SuiNaviTradeTool(suiAgentKit),
    new SuiSuilendDepositTool(suiAgentKit),
    new SuiSuilendBorrowTool(suiAgentKit),
    new SuiSuilendWithdrawTool(suiAgentKit),
    new SuiSuilendRepayTool(suiAgentKit),
    new DescreenerTokenDataByAddressTool(suiAgentKit),
    new DescreenerTokenDataByTickerTool(suiAgentKit),
    new PythPriceTool(suiAgentKit),
    new PythEMAPriceTool(suiAgentKit),
  ];
}

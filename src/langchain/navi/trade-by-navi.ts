import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiNaviTradeTool extends Tool {
    name = "sui_navi_trade";
    description = `Swap tokens using the Navi Protocol.

    Inputs (input is a JSON string):
    - from: string, the type of input coin. Example: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" (required)
    - target: string, the type of output coin. Example: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI" (required)
    - amount: string, the amount of tokens. If byAmountIn is true, this is the input token amount. Otherwise, it is the output token amount. Example: "100" (required)
    
    DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
    CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER
    `;
    
    constructor(private suiAgentKit: SuiAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        const parsedInput = JSON.parse(input);

        const tx = await this.suiAgentKit.tradeByNavi(parsedInput.target, parsedInput.amount, parsedInput.from);
  
        return JSON.stringify({
          status: "success",
          message: `Trade executed successfully`,
          transaction: tx,
          amount: parsedInput.amount,
          from: parsedInput.from || "SUI",
          target: parsedInput.target,
        });
      } catch (error: any) {
        return JSON.stringify({
          status: "error",
          message: error.message,
          code: error.code || "UNKNOWN_ERROR",
        });
      }
    }
  }
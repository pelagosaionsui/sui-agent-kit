import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import BN from "bn.js";

export class SuiTradeTool extends Tool {
    name = "sui_trade";
    description = `This tool can be used to swap tokens to another token ( It uses Cetus Protocol ).
  
    Inputs ( input is a JSON string ):
    from: string, the coin type of input coin. eg "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" (required)
    target: string, the coin type of output coin. eg "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI" (required)
    amount: string, the token amount. If byAmountIn is true, this is the input token amount. Otherwise, this would be the output token amount. eg 100 (required)`;
    
    // Currently, we dont support inverse swap since llm is not smart enough to know the inverse direction of swap so we took out below part in description
    // byAmountIn: boolean, true if user specified input token amount, false if user specified output token amount (required)

    constructor(private suiAgentKit: SuiAgentKit) {
      super();
    }
  
    protected async _call(input: string): Promise<string> {
      try {
        const parsedInput = JSON.parse(input);

        console.log(parsedInput);

        const tx = await this.suiAgentKit.trade(parsedInput.target, parsedInput.amount, parsedInput.from, parsedInput.byAmountIn);
  
        return JSON.stringify({
          status: "success",
          message: "Trade executed successfully",
          transaction: tx,
          inputAmount: parsedInput.inputAmount,
          inputToken: parsedInput.inputMint || "SOL",
          outputToken: parsedInput.outputMint,
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
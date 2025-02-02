import { Tool } from "langchain/tools"
import { SuiAgentKit } from '../../agent';
import { TOKENS } from "../../constants";


export class SuiTransferTool extends Tool {
    name = "sui_transfer";
    description = `Transfer tokens or SUI to another wallet address.

    Inputs (input is a JSON string):
    - to: string, the recipient's wallet address. Example: "0x12fefd0c521cb04e42646034af7812229c44789583a22a358f0f9430fb348990" (required)
    - amount: number, the amount of tokens to send. Example: 1 (required)
    - tokenAddress: string, the type of token. If not specified, defaults to "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI". Example: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI"`;

    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
            const parsedInput = JSON.parse(input);
            const tokenAddress = parsedInput.tokenAddress || TOKENS.SUI;

            const tx = await this.suiAgentKit.transfer(parsedInput.to, parsedInput.amount, tokenAddress);
            
            return JSON.stringify({
              status: "success",
              message: "Transfer completed successfully",
              amount: parsedInput.amount,
              recipient: parsedInput.to,
              token: tokenAddress || "SUI",
              transaction: tx,
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
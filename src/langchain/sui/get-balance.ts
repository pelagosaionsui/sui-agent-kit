import { Tool } from "langchain/tools"
import { SuiAgentKit } from '../../agent';
import { TOKENS } from "../../constants";
import { string } from "zod";

export class SuiGetBalanceTool extends Tool {
    name = "sui_balance";
    description = `Retrieve the balance of a SUI wallet or token account.

    - If you want to get the balance of your wallet, you don't need to provide a tokenAddress.
    - If no tokenAddress is provided, the balance will be in SUI.

    Inputs (input is a JSON string):
    - tokenAddress: string, e.g., "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" (optional)
    
    This is the input format: 
    '{"tokenAddress": "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"}'
    
    DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
    CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER
    `;
    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<any> {
        try {
            let tokenAddress = TOKENS.SUI;
            
            if (input) {
                const parsedInput = JSON.parse(input);
                tokenAddress = parsedInput.tokenAddress || TOKENS.SUI;
            } else {
                console.log('No token address provided, defaulting to SUI balance')
            }
            
            const balance = await this.suiAgentKit.getBalance(tokenAddress);
            
            return JSON.stringify({
                status: "success",
                balance,
                token: input || "SUI",
            });
        } catch (error: any) {
            console.error('Error retrieving balance:', error.message, 'Error stack trace:', error.stack);

            return JSON.stringify({
                status: "error",
                message: error.message,
                code: error.code || "UNKNOWN_ERROR",
            });
        }
    }
}
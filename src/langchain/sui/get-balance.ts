import { Tool } from "langchain/tools"
import { SuiAgentKit } from '../../agent';
import { TOKENS } from "../../constants";

export class SuiGetBalanceTool extends Tool {
    name = "sui_balance";
    description = `Get the balance of a SUI wallet or token account.
    
    If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
    If no tokenAddress is provided, the balance will be in SUI.

    Inputs ( input is a JSON string ):
    tokenAddress: string, eg "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" (optional)`;
    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<any> {
        try {
            let tokenAddress = TOKENS.SUI;

            if (input) {
                const json = JSON.parse(input);
                tokenAddress = json.tokenAddress;
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
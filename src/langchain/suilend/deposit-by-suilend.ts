import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiSuilendDepositTool extends Tool {
    name = "sui_suilend_deposit";
    description = `Use this tool to deposit your SUI or other supported coins to Suiland.

    Inputs (input is a JSON string):
    - coinType: string, e.g., "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" (required)
    - amount: number, e.g., 1 or 0.01 (required)

    DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
    CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER
    `;

    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
        const parsedInput = JSON.parse(input);

        const tx = await this.suiAgentKit.depositBySuilend(parsedInput.coinType, parsedInput.amount);

        return JSON.stringify({
            status: "success",
            message: "Deposit successfully",
            transaction: tx,
            coinType: parsedInput.coinType,
            amount: parsedInput.amount,
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
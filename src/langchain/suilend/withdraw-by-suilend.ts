import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiSuilendWithdrawTool extends Tool {
    name = "sui_suilend_withdraw";
    description = `Use this tool to withdraw your deposited coins from Suiland.

    Inputs (input is a JSON string):
    - coinType: string, the coin user want to withdraw. e.g., "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" (required)
    - amount: number, the amount of the coin. e.g., 1 or 0.01 (required)

    DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
    CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER
    `;

    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
        const parsedInput = JSON.parse(input);

        const tx = await this.suiAgentKit.withdrawBySuilend(parsedInput.coinType, parsedInput.amount);

        return JSON.stringify({
            status: "success",
            message: "Withdraw successfully",
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
import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiStakeTool extends Tool {
    name = "sui_stake";
    description = `Use this tool to stake your SUI or other supported coins with Spring Sui (liquid staking).

    Inputs (input is a JSON string):
    - amount: number, e.g., 1 or 0.01 (required)
    - lstTokenAddress: string, the type of liqudity staking token returned after staking and the default token returned is "0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI". Example: "0x02358129a7d66f943786a10b518fdc79145f1fc8d23420d9948c4aeea190f603::fud_sui::FUD_SUI" (optional)

    DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
    CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER
    `;

    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
        try {
        const parsedInput = JSON.parse(input);

        const tx = await this.suiAgentKit.stake(parsedInput.amount, parsedInput.lstTokenAddress);

        return JSON.stringify({
            status: "success",
            message: "Staked successfully",
            transaction: tx,
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
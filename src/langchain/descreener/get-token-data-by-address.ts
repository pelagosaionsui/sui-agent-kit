import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class DescreenerTokenDataByAddressTool extends Tool{
  name = "get_token_data_by_address_from_descreener";
  description = `Get token data from DexScreener by token address.

  Input (input is a JSON string):
  - tokenAddress: string, the token address to fetch data. Example: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI" (required)

  DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
  CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER.
  `;

  constructor(private suiAgentKit: SuiAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tokenData = await this.suiAgentKit.getTokenDataByAddress(parsedInput.tokenAddress);      
      
      return JSON.stringify({
        status: "success",
        message: `Token data fetched successfully`,
        tokenData: tokenData,
      });
    } catch (error: any) {
      console.log("error", error);
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
};
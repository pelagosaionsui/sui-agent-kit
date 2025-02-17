import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class DescreenerTokenDataByTickerTool extends Tool{
  name = "get_token_data_by_ticker_from_descreener";
  description = `Get token data from DexScreener by token ticker.

  Input format is a JSON string, containing below fields:
  - tokenTicker: string, the token ticker to fetch data. Example: "LOFI" (required)

  Example input:
  {
    "tokenTicker": "LOFI"
  }

  DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
  CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER.
  `;

  constructor(private suiAgentKit: SuiAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tokenData = await this.suiAgentKit.getTokenDataByTicker(parsedInput.tokenTicker);      
      
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
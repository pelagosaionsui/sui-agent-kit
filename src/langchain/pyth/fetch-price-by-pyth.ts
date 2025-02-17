import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class PythPriceTool extends Tool {
    name = "pyth_price";
    description = `Use this tool to fetch the real-time price of a coin from Pyth by ticker.
    
    Input format is a JSON string, containing below fields:
    - ticker: string, the ticker of the coin. e.g., "LOFI" or "SEND" (required)

    Example input:
    {
        "ticker": "LOFI"
    }

    DO NOT UNDER ANY CIRCUMSTANCES STRAY FROM THE INPUT FORMAT
    CONVERT YOUR INPUT WITH INPUT FORMAT AND PARAMS IN THE EXACT ORDER
    `;

    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    protected async _call(input: string): Promise<string> {
      try {
        const parsedInput = JSON.parse(input);
        const priceFeedID = await this.suiAgentKit.fetchPythPriceFeedID(parsedInput.ticker);
        const price = await this.suiAgentKit.fetchPythPrice(priceFeedID);

        return JSON.stringify({
          status: "success",
          message: `Price fetched successfully`,
          price: price,
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
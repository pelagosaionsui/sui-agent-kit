import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { tradeByNavi } from "../../tools";

const tradeByNaviAction: Action = {
  name: "TRADE_BY_NAVI",
  similes: [
    "swap tokens",
    "exchange tokens",
    "trade tokens",
    "convert tokens",
    "swap SUI",
  ],
  description: `This tool can be used to swap tokens to another token (It uses Navi Protocol).`,
  examples: [
    [
      {
        input: {
          from: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          target: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI",
          amount: 1,
        },
        output: {
          status: "success",
          message: "Trade executed successfully",
          transaction:
            "5NvEF2PthwRfSCs3NNtgfo4LmaBwYeVMDQNaztohmCuT",
          from: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          target: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI",
          amount: 1,
        },
        explanation: "Swap 1 SUI for LOFI",
      },
    ],
  ],
  schema: z.object({
    from: z.string().min(32, "Invalid from token address"),
    target: z.string().min(32, "Invalid target token address"),
    amount: z.number().positive("Input amount must be positive"),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const tx = await tradeByNavi(agent, input.target, input.amount, input.from);

    return {
      status: "success",
      message: "Trade executed successfully",
      transaction: tx,
      amount: input.amount,
      from: input.from || "SUI",
      target: input.target,
    };
  },
};

export default tradeByNaviAction;
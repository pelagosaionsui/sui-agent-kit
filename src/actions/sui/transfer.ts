import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { transfer } from "../../tools/sui/transfer";

const transferAction: Action = {
  name: "TRANSFER",
  similes: [
    "send tokens",
    "transfer funds",
    "send money",
    "send SUI",
    "transfer tokens",
  ],
  description: `This tool can be used to transfer token to another wallet address`,
  examples: [
    [
      {
        input: {
          to: "0x12fefd0c521cb04e42646034af7812229c44789583a22a358f0f9430fb348990",
          amount: 1,
          tokenAddress: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI",
        },
        output: {
          status: "success",
          message: "Transfer executed successfully",
          transaction:
            "5NvEF2PthwRfSCs3NNtgfo4LmaBwYeVMDQNaztohmCuT",
            to: "0x12fefd0c521cb04e42646034af7812229c44789583a22a358f0f9430fb348990",
            amount: 1,
            tokenAddress: "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI",
        },
        explanation: "Transfer 1 LOFI to 0x12fefd0c521cb04e42646034af7812229c44789583a22a358f0f9430fb348990",
      },
    ],
  ],
  schema: z.object({
    to: z.string().min(32, "Invalid to wallet address"),
    amount: z.number().positive("Input amount must be positive"),
    tokenAddress: z.string().min(32, "Invalid tokenAddress"),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const tx = await transfer(agent, input.to, input.amount, input.tokenAddress);

    return {
      status: "success",
      message: "Trade executed successfully",
      transaction: tx,
      amount: input.amount,
      to: input.to,
      token: input.tokenAddress || "SUI",
    };
  },
};

export default transferAction;
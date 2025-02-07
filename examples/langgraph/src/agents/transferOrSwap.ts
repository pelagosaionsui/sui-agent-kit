import { gpt4o } from "../utils/model";
import { agentKit } from "../utils/suiAgent";
import { suiAgentState } from "../utils/state";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { transferSwapPrompt } from "../prompts/transferSwap";
import { SuiTransferTool } from "@pelagosai/sui-agent-kit/dist/langchain";

const transferOrSwapAgent = createReactAgent({
  stateModifier: transferSwapPrompt,
  llm: gpt4o,
  tools: [new SuiTransferTool(agentKit)],
});

export const transferSwapNode = async (
  state: typeof suiAgentState.State,
) => {
  const { messages } = state;

  const result = await transferOrSwapAgent.invoke({
    messages,
  });

  return result;
};

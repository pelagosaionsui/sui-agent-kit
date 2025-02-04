import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { gpt4o } from "../utils/model";
import { suiAgentState } from "../utils/state";
import { SuiGetBalanceTool } from "@pelagosai/sui-agent-kit/dist/langchain";
import { agentKit } from "../utils/suiAgent"; // Assuming suiAgent is exported from this file

const readAgent = createReactAgent({
  llm: gpt4o,
  tools: [new SuiGetBalanceTool(agentKit)],
});

export const readNode = async (state: typeof suiAgentState.State) => {
  const { messages } = state;

  const result = await readAgent.invoke({ messages });

  return { messages: [...result.messages] };
};
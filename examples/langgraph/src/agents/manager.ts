import { prompt, parser } from "../prompts/manager";
import { RunnableSequence } from "@langchain/core/runnables";
import { suiAgentState } from "../utils/state";
import { gpt4o } from "../utils/model";

const chain = RunnableSequence.from([prompt, gpt4o, parser]);

export const managerNode = async (state: typeof suiAgentState.State) => {
  const { messages } = state;

  const result = await chain.invoke({
    formatInstructions: parser.getFormatInstructions(),
    messages: messages,
  });

  const { isSuiReadQuery, isSuiWriteQuery, isGeneralQuery } = result;

  return {
    isSuiReadQuery,
    isSuiWriteQuery,
    isGeneralQuery,
  };
};
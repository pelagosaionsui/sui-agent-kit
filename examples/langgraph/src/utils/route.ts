import { suiAgentState } from "./state";
import { END } from "@langchain/langgraph";

export const managerRouter = (state: typeof suiAgentState.State) => {
  const { isSuiReadQuery, isSuiWriteQuery, isGeneralQuery } = state;

  if (isGeneralQuery) {
    return "generalist";
  } else if (isSuiWriteQuery) {
    return "transferSwap";
  } else if (isSuiReadQuery) {
    return "read";
  } else {
    return END;
  }
};

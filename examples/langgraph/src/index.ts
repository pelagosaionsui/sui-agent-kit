import { StateGraph } from "@langchain/langgraph";
import { START, END } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { suiAgentState } from "./utils/state";
import { generalistNode } from "./agents/generalAgent";
import { managerNode } from "./agents/manager";
import { transferSwapNode } from "./agents/transferOrSwap";
import { readNode } from "./agents/readAgent";
import { managerRouter } from "./utils/route";

const workflow = new StateGraph(suiAgentState)
    .addNode("generalist", generalistNode)
    .addNode("manager", managerNode)
    .addNode("transferSwap", transferSwapNode)
    .addNode("read", readNode)
    .addEdge(START, "manager")
    .addConditionalEdges("manager", managerRouter)
    .addEdge("generalist", END)
    .addEdge("transferSwap", END)
    .addEdge("read", END);

export const graph = workflow.compile();

// example of get balance
const balance_result = await graph.invoke({
  messages: [new HumanMessage("what is my balance of wallet?")],
});

console.log(balance_result);

// example of swap
const swap_result = await graph.invoke({
  messages: [new HumanMessage("Swap 0.1 SUI to LOFI")],
});

console.log(swap_result);

// example of transfer
const transfer_result = await graph.invoke({
  messages: [new HumanMessage("Transfer 1 LOFI to 0xe311b945a4f11b5523ad35d069fd08b58c593efcd13b1f3a6e32ad0b2b5fad3a")],
});

console.log(transfer_result);
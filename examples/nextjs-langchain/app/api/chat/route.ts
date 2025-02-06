import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SuiAgentKit, createSuiTools } from "@pelagosai/sui-agent-kit";

const llmOpenai = new ChatOpenAI({
    temperature: 0.7,
    model: "gpt-4o-mini",
});

const llmDeepseek = new ChatDeepSeek({
  model: "deepseek-reasoner",
  temperature: 0.3,
  apiKey: process.env.OPENAI_API_KEY!,
});

const suiAgent = new SuiAgentKit(
    process.env.SUI_PRIVATE_KEY!,
    process.env.RPC_URL!,
    process.env.OPENAI_API_KEY!,
)

const tools = createSuiTools(suiAgent);
const memory = new MemorySaver();

const agent = createReactAgent({
    llm: llmOpenai, // or llmDeepseek
    tools,
    checkpointSaver: memory,
    messageModifier: `
        You are a helpful agent that can interact onchain using the Sui Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Sui Agent Kit, recommend they go to https://www.pelagos-ai.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
    `,
}
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const messages = body.messages ?? [];
    
        const eventStream = agent.streamEvents(
          {
            messages,
          },
          {
            version: "v2",
            configurable: {
              thread_id: "Sui Agent Kit!",
            },
          },
        );
    
        const textEncoder = new TextEncoder();
        const transformStream = new ReadableStream({
          async start(controller) {
            for await (const { event, data } of eventStream) {
              if (event === "on_chat_model_stream") {
                if (data.chunk.content) {
                  controller.enqueue(textEncoder.encode(data.chunk.content));
                }
              }
            }
            controller.close();
          },
        });
    
        return new Response(transformStream);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
    }
  }
  
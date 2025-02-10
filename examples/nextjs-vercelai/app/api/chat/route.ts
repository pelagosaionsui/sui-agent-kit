import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { SuiAgentKit, createSuiVercelAITools } from "@pelagosai/sui-agent-kit";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const config = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
}

const suiAgent = new SuiAgentKit(
  process.env.RPC_URL!,
  config,
  process.env.SUI_PRIVATE_KEY!,
)

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.message ? [{ role: JSON.parse(body.message)['role'], content: JSON.parse(body.message)['content']}] : [];

  const address = body.requestData;
  suiAgent.walletAddress = address;
  
  const tools = createSuiVercelAITools(suiAgent);

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    toolCallStreaming: true,
    maxSteps: 5, // multi-steps for server-side tools
    tools: tools,
  });

  return result.toDataStreamResponse();
}

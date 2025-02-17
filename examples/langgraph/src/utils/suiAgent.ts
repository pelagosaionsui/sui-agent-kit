import { SuiAgentKit, createSuiTools } from '@pelagosai/sui-agent-kit';

export const agentKit = new SuiAgentKit(
  process.env.SUI_PRIVATE_KEY!,
  process.env.RPC_URL!,
  { OPENAI_API_KEY: process.env.OPENAI_API_KEY! }
);

export const suiTools = createSuiTools(agentKit);

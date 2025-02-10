# sui-agent-kit
The Autonomous and Composable AI Agent Framework on Sui

## ⚙️ Core Blockchain Features

- **Token Operations**
    - Transfer assets
    - Balance checks

- **DeFi Integration**
    - Navi Aggregator swap
    - Cetus Aggregator swap
    - Suilend deposit/lend/withdraw/repay
    - SpringSui staking/unstaking

- **Wallet Integration**
    - Supports wallet integration or private key 

## 🤖 AI Integration Features

- **LangChain Integration**
  - Deliver ready-to-use LangChain tools for blockchain operations
  - Support autonomous agents with React framework
  - Enable Memory management for consistent interactions
  - Provide real-time feedback via streaming responses
 
- **LangGraph Multi-Agent System**
  - Leverage LangGraph's StateGraph for Multi-agent architecture
  - Provide different specialized agents
    - A general-purpose agent for handling basic queries
    - A Transfer/Swap agent for executing transactions
    - A Read agent for retrieving blockchain data
    - A Manager agent for coordination and task routing

- **Vercel AI Integration**
  - Integrate with Vercel AI for seamless AI agent integration
  - Compatible with any framework
  - Effortless and rapid toolkit deployment

## 🛡️ Security
The toolkit supports both private keys and wallet integration which satisified different use case's need.

Note: if you leverage private keys for our toolkit, make sure using it in a secure environment

## ⚒ Installation

```bash
npm install @pelagosai/sui-agent-kit
```

```
import { SuiAgentKit } from "@pelagos/sui-agent-kit";
 
const suiAgent = new SuiAgentKit(
    WALLET_PRIVATE_KEY,
    RPC_URL,
    OPENAI_API_KEY,
);
 
// Get your sui balance
const suiBalance = await suiAgent.getBalance();
```

## License

Apache-2 License



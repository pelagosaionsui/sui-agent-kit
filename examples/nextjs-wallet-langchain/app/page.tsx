import { ChatWindow } from '../components/ChatWindow';

const Home = () => {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl md:text-4xl">
          Pelagos SuiAgentKit + LangChain.js 🦜🔗 + Next.js
        </h1>
      </div>
      <ul>
        <li className="text-l">
          🤝
          <span className="ml-2">
            This template showcases a simple agent chatbot using{' '}
            <a href="https://www.pelagos-ai.xyz">SuiAgentKit</a>
            {', '}
            <a href="https://js.langchain.com/" target="_blank">
              LangChain.js
            </a>{' '}
            and the Vercel{' '}
            <a href="https://sdk.vercel.ai/docs" target="_blank">
              AI SDK
            </a>{' '}
            in a{' '}
            <a href="https://nextjs.org/" target="_blank">
              Next.js
            </a>{' '}
            project.
          </span>
        </li>
        <li className="hidden text-l md:block">
          💻
          <span className="ml-2">
            You can find the prompt and model logic for this use-case in{' '}
            <code>app/api/chat/route.ts</code>.
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            The main frontend logic is found in <code>app/page.tsx</code>.
          </span>
        </li>
        <li className="text-l">
          🐙
          <span className="ml-2">
            This template is open source - you can see the source code and
            deploy your own version{' '}
            <a
              href="https://github.com/pelagosaionsui/sui-agent-kit"
              target="_blank"
            >
              from the GitHub repo
            </a>
            !
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            Try asking e.g. <code>What is my wallet address?</code> below!
          </span>
        </li>
        <li className="text-l">
          🤖
          <span className="ml-2">
            Try some DeFi operation e.g. <code>Transfer 1 Sui to 0x...</code>, <code> Stake 1 SUI </code> or <code> Swap 1 SUI into 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC</code>
          </span>
        </li>
      </ul>
    </div>
  );

  return (
    <ChatWindow
      endpoint="api/chat"
      emoji="🌊"
      titleText="Pelagos Sui Agent"
      placeholder="I'm your friendly Sui agent of Pelagos! Ask me anything..."
      emptyStateComponent={InfoCard}
    />
  );
};

export default Home;

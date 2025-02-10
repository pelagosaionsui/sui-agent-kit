import { WalletProvider } from '@/components/WalletProvider';
import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { WalletButton } from '@/components/WalletButton';
import { Header } from '@/components/Header';
const inter = Inter({ subsets: ['latin'] });

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Pelagos SuiAgentKit + LangChain + Next.js Template</title>
        <link rel="shortcut icon" href="/images/pelagos.ico" />
        <meta
          name="description"
          content="Starter template showing how to use SuiAgentKit with Langchain in Next.js projects."
        />
        <meta
          property="og:title"
          content="Pelagos SuiAgentKit + LangChain + Next.js Template"
        />
        <meta
          property="og:description"
          content="Starter template showing how to use SuiAgentKit with LangChain in Next.js projects."
        />
        <meta property="og:image" content="/images/title-card.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Pelagos SuiAgentKit + LangChain + Next.js Template"
        />
        <meta
          name="twitter:description"
          content="Starter template showing how to use SuiAgentKit with LangChain in Next.js projects."
        />
        <meta name="twitter:image" content="/images/title-card.png" />
      </head>
      <body className={spaceGrotesk.className}>
        <WalletProvider>
          <Header />
          <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 to-primary-600/10 animate-gradient"></div>
          <div className="flex flex-col p-4 md:p-12 h-[100vh] relative z-10">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
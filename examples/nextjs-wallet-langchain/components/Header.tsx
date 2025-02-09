'use client';

import { ConnectButton } from '@suiet/wallet-kit';

export function Header() {
  return (
    <header className="fixed top-0 right-0 p-4 z-50">
      <ConnectButton className="px-4 py-2 !bg-primary-600 !hover:bg-primary-700 text-white !rounded-md transition-colors">
        Connect Wallet
      </ConnectButton>
    </header>
  );
}

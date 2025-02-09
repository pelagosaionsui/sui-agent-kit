'use client';
import { ConnectButton } from '@suiet/wallet-kit';

export function WalletButton() {
  return (
    <ConnectButton className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-black transition-colors" />
  );
}
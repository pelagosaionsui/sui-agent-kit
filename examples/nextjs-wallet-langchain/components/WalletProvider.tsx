'use client';

import { WalletProvider as SuietWalletProvider } from '@suiet/wallet-kit';
import { ReactNode } from 'react';

export function WalletProvider({ children }: { children: ReactNode }) {
  return <SuietWalletProvider>{children}</SuietWalletProvider>;
}

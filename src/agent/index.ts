import { Config } from '../types';
import { SuiClient, SuiHTTPTransport } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import {
  getBalance,
  tradeByCetus,
  tradeByNavi,
  transfer,
  stakeBySpringsui,
  depositBySuilend,
  borrowBySuilend,
  getTokenDataByAddress,
  getTokenDataByTicker,
  getTokenAddressFromTicker,
  fetchPythPriceFeedID,
  fetchPythPrice, 
  fetchPythEMAPrice,
} from '../tools';
import { withdrawBySuilend } from '../tools/suilend/withdraw-by-suilend';
import { repayBySuilend } from '../tools/suilend/repay-by-suilend';
import { WalletContextState } from '@suiet/wallet-kit';
import { isValidSuiAddress } from '../utils/validate-token-address';
import { unstakeBySpringsui } from '../tools/suilend/unstake-by-springsui';

/**
 * Main class for interacting with Sui blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class SuiAgentKit
 * @constructor
 * @param {string} privateKey - Private key of the agent
 * @param {string} rpcUrl - RPC URL of the SUI network
 * @param {Config | string | null} configOrKey - Configuration object or OpenAI API key
 */
export class SuiAgentKit {
  public suiClient: SuiClient;
  public keypair?: Ed25519Keypair;
  public walletState?: WalletContextState;
  public walletAddress?: string;
  public config: Config;

  constructor(
    rpcUrl: string,
    configOrKey: string | null | Config,
    privateKey?: string
  ) {
    this.suiClient = new SuiClient({
      transport: new SuiHTTPTransport({
        url: rpcUrl,
        fetch: fetch,
      }),
    });

    if (typeof configOrKey === 'string' || configOrKey === null) {
      this.config = { OPENAI_API_KEY: configOrKey || '' };
    } else {
      this.config = configOrKey;
    }

    if (privateKey) {
      const { secretKey } = decodeSuiPrivateKey(privateKey);
      this.keypair = Ed25519Keypair.fromSecretKey(secretKey);
      this.walletAddress = this.keypair.getPublicKey().toSuiAddress();
    }
  }

  setWalletAddress(walletAddress: string) {
    if (!isValidSuiAddress(walletAddress)) {
      throw new Error(`Invalid Wallet Address: ${walletAddress}`);
    }
    try {
      this.walletAddress = walletAddress;
    } catch (e: any) {
      console.error('Failed to set wallet address: ', e);
      return false;
    }
    return true;
  }

  async getBalance(tokenAddress?: string): Promise<string> {
    return getBalance(this, tokenAddress);
  }

  async tradeByCetus(
    target: string,
    amount: number,
    from?: string,
    byAmountIn?: boolean
  ): Promise<string> {
    return tradeByCetus(this, target, amount, from, byAmountIn);
  }

  async tradeByNavi(
    target: string,
    amount: number,
    from?: string
  ): Promise<string> {
    return tradeByNavi(this, target, amount, from);
  }

  async transfer(
    to: string,
    amount: number,
    tokenAddress: string
  ): Promise<string> {
    return transfer(this, to, amount, tokenAddress);
  }

  async stakeBySpringsui(
    amount: number,
    tokenAddress: string
  ): Promise<string> {
    return stakeBySpringsui(this, amount, tokenAddress);
  }

  async unstakeBySpringsui(
    amount: number,
    tokenAddress: string
  ): Promise<string> {
    return unstakeBySpringsui(this, amount, tokenAddress);
  }

  async depositBySuilend(coinType: string, amount: number): Promise<string> {
    return depositBySuilend(this, coinType, amount);
  }

  async borrowBySuilend(coinType: string, amount: number): Promise<string> {
    return borrowBySuilend(this, coinType, amount);
  }

  async withdrawBySuilend(coinType: string, amount: number): Promise<string> {
    return withdrawBySuilend(this, coinType, amount);
  }

  async repayBySuilend(coinType: string, amount: number): Promise<string> {
    return repayBySuilend(this, coinType, amount);
  }

  async getTokenDataByAddress(tokenAddress: string): Promise<any> {
    return getTokenDataByAddress(tokenAddress);
  }

  async getTokenDataByTicker(ticker: string): Promise<any> {
    return getTokenDataByTicker(ticker);
  }

  async getTokenAddressFromTicker(ticker: string): Promise<string> {
    return getTokenAddressFromTicker(ticker);
  }

  async fetchPythPriceFeedID(ticker: string): Promise<string> {
    return fetchPythPriceFeedID(ticker);
  }

  async fetchPythPrice(feedID: string): Promise<string> {
    return fetchPythPrice(feedID);
  }

  async fetchPythEMAPrice(feedID: string): Promise<string> {
    return fetchPythEMAPrice(feedID);
  }
}

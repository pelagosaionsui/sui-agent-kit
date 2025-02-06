import { Config } from '../types';
import { SuiClient, SuiHTTPTransport } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { getBalance, tradeByCetus, tradeByNavi, transfer, stakeBySpringsui, depositBySuilend, borrowBySuilend } from '../tools';
import { withdrawBySuilend } from '../tools/suilend/withdraw-by-suilend';
import { repayBySuilend } from '../tools/suilend/repay-by-suilend';

/**
 * Main class for interacting with Sui blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class SuiAgentKit
 * @constructor
 * @param {string} private_key - Private key of the agent
 * @param {string} rpc_url - RPC URL of the SUI network
 * @param {Config | string | null} configOrKey - Configuration object or OpenAI API key
 */
export class SuiAgentKit {
  public suiClient: SuiClient;
  public wallet: Ed25519Keypair;
  public walletAddress: Ed25519PublicKey;
  public config: Config;

  constructor(
    private_key: string,
    rpc_url: string,
    openai_api_key: string | null
  );
  constructor(private_key: string, rpc_url: string, config: Config);
  constructor(
    private_key: string,
    rpc_url: string,
    configOrKey: Config | string | null
  ) {
    this.suiClient = new SuiClient({
      transport: new SuiHTTPTransport({
        url: rpc_url,
        fetch: fetch,
      }),
    });

    const { secretKey } = decodeSuiPrivateKey(private_key);
    this.wallet = Ed25519Keypair.fromSecretKey(secretKey);
    this.walletAddress = this.wallet.getPublicKey();

    // Handle both old and new patterns
    if (typeof configOrKey === 'string' || configOrKey === null) {
      this.config = { OPENAI_API_KEY: configOrKey || '' };
    } else {
      this.config = configOrKey;
    }
  }

  async getBalance(tokenAddress?: string): Promise<number> {
    return getBalance(this, tokenAddress);
  }

  async tradeByCetus(target: string,  amount: number, from?: string, byAmountIn?: boolean): Promise<string> {
    return tradeByCetus(this, target, amount, from, byAmountIn);
  }

  async tradeByNavi(target: string,  amount: number, from?: string): Promise<string> {
    return tradeByNavi(this, target, amount, from);
  }

  async transfer(to: string, amount: number, tokenAddress: string): Promise<string> {
    return transfer(this, to, amount, tokenAddress);
  }

  async stakeBySpringsui(amount: number, tokenAddress: string): Promise<string> {
    return stakeBySpringsui(this, amount, tokenAddress);
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
}
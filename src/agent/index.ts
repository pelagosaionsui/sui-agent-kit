import { Config } from '../types';
import { SuiClient, SuiHTTPTransport } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { getBalance, trade, transfer, stake } from '../tools';

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

  async trade(target: string,  amount: number, from?: string, byAmountIn?: boolean): Promise<string> {
    return trade(this, target, amount, from, byAmountIn);
  }

  async transfer(to: string, amount: number, tokenAddress: string): Promise<string> {
    return transfer(this, to, amount, tokenAddress);
  }

  async stake(amount: number, tokenAddress: string): Promise<string> {
    return stake(this, amount, tokenAddress);
  }
}
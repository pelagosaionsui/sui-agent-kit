import { SuiAgentKit } from '../../index';
import { isValidSuiTokenAddress } from '../../utils/validate-token-address';
import { TOKENS, MIST_PER_SUI } from '../../constants';

/**
 * Retrieves the balance of a specified token for a given agent.
 *
 * @param agent - The SuiAgentKit instance containing the wallet and client information.
 * @param tokenAddress - (Optional) The address of the token to check the balance for. Defaults to SUI token if not provided or invalid.
 * @returns A promise that resolves to the balance of the specified token in SUI.
 * @throws Will throw an error if the balance retrieval fails.
 */
export async function getBalance(
  agent: SuiAgentKit,
  tokenAddress?: string
): Promise<number> {
  try {
    if (!agent.walletAddress) {
      throw new Error('Wallet not connected');
    }

    if (!isValidSuiTokenAddress(tokenAddress)) {
      tokenAddress = TOKENS.SUI;
    }

    const walletAddress = agent.walletAddress;
    const balanceResponse = await agent.suiClient.getBalance({
      owner: walletAddress,
      coinType: tokenAddress,
    });
    return Number(balanceResponse.totalBalance) / MIST_PER_SUI;
  } catch (error: any) {
    console.error(
      'Error getting balance:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}

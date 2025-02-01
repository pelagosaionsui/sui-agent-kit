import { SuiAgentKit } from "../../index";
import {isValidSuiTokenAddress} from "../../utils/validate-token-address";
import { TOKENS, MIST_PER_SUI } from "../../constants";

/**
 * Get the balance of SUI or specific token for the agent's wallet
 * @param agent The SuiAgentKit instance
 * @param token_address The specific token address. If not provided, the balance of SUI will be returned
 * @returns The balance of the token
 */
export async function getBalance(
  agent: SuiAgentKit,
  token_address?: string,
): Promise<number> {
    try {
        if (!isValidSuiTokenAddress(token_address)) {
            token_address = TOKENS.SUI;
        }

        const wallet_address = agent.wallet_address.toSuiAddress();
        const balanceResponse = await agent.suiClient.getBalance({ owner: wallet_address.toString(), coinType: token_address });
        return Number(balanceResponse.totalBalance) / MIST_PER_SUI;
    } catch (error: any) {
        console.error('Error getting balance:', error.message, 'Error stack trace:', error.stack);
        throw new Error(`Failed to get balance: ${error.message}`);
    }
}
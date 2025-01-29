import { SuiAgentKit } from "../../index";
import {isValidSuiAddress} from "../../utils/validate-token-address";

const MIST_PER_SUI = 1000000000;

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
        if (!isValidSuiAddress(token_address)) {
            console.log('No token address provided, defaulting to SUI balance');
            token_address = "0x2::sui::SUI";
        }

        const wallet_address = agent.wallet_address.toSuiAddress();
        const balanceResponse = await agent.suiClient.getBalance({ owner: wallet_address.toString(), coinType: token_address });
        return Number(balanceResponse.totalBalance) / MIST_PER_SUI;
    } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
}
import { SuiAgentKit } from "../../index";
import { Transaction } from '@mysten/sui/transactions';
import { isValidSuiTokenAddress } from "../../utils/validate-token-address";
import { getCoinsFromWallet } from "../../utils/get-coins-from-wallet";
import { SUIVISION_URL } from "../../constants";

/**
 * Transfers a specified amount of tokens from the agent's wallet to a recipient address.
 *
 * @param {SuiAgentKit} agent - The agent instance containing the wallet and client information.
 * @param {string} to - The recipient's address to which the tokens will be transferred.
 * @param {number} amount - The amount of tokens to transfer.
 * @param {string} [tokenAddress] - The token address to transfer.
 * @returns {Promise<string>} A promise that resolves to a JSON string containing the transfer status and transaction details.
 * @throws {Error} If the token address is invalid, if there is an insufficient balance, or if the transfer fails.
 */
export async function transfer(
  agent: SuiAgentKit,
  to: string,
  amount: number,
  tokenAddress: string,
): Promise<string> {
  try {
    if (!isValidSuiTokenAddress(tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenAddress}`);
    }

    const fromCoinAddressMetadata = await agent.suiClient.getCoinMetadata({coinType: tokenAddress});

    if (!fromCoinAddressMetadata) {
        throw new Error(`Invalid from coin address: ${tokenAddress}`);
    }

    const total = BigInt(amount) * (BigInt(10) ** BigInt(fromCoinAddressMetadata.decimals));

    // Get coins from the wallet
    const selectedCoins = await getCoinsFromWallet(agent, tokenAddress, total);

    if (!selectedCoins.length) {
        throw new Error(`Insufficient balance of ${tokenAddress}`);
    }

    // Process coins including merge and split
    const tx = new Transaction();
    const coinObjects = selectedCoins.map((coin) => tx.object(coin.objectId));

    if (coinObjects.length > 1) {
        tx.mergeCoins(coinObjects[0], coinObjects.slice(1));
    }

    const splitedCoins = tx.splitCoins(coinObjects[0], [total]);
    
    // Transfer coins to the recipient
    tx.transferObjects([splitedCoins[0]], to);
    const result = await agent.suiClient.signAndExecuteTransaction({ signer: agent.wallet, transaction: tx });
    
    return JSON.stringify({
      status: "success",
      message: `Transfer completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL+result.digest}`,
      transaction: result.transaction,
    });
  } catch (error: any) {
    console.error('Error transferring:', error.message, 'Error stack trace:', error.stack);
    throw new Error(`Failed to transfer: ${error.message}`);
  }
}
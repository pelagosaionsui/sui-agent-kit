import { SuiAgentKit } from '../../index';
import { Transaction } from '@mysten/sui/transactions';
import { isValidSuiTokenAddress } from '../../utils/validate-token-address';
import { getCoinsFromWallet } from '../../utils/get-coins-from-wallet';
import { SUIVISION_URL } from '../../constants';
import { processCoins } from '../../utils/process-coins';
import { getCoinAmount } from '../../utils/get-coin-amount';

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
  tokenAddress: string
): Promise<string> {
  try {
    if (!agent.walletAddress) {
      throw new Error('Wallet not connected');
    }

    if (!isValidSuiTokenAddress(tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenAddress}`);
    }

    const total = await getCoinAmount(agent, amount, tokenAddress);

    // Get coins from the wallet
    const selectedCoins = await getCoinsFromWallet(agent, tokenAddress, total);

    if (!selectedCoins.length) {
      throw new Error(`Insufficient balance of ${tokenAddress}`);
    }

    // Process coins including merge and split
    const tx = new Transaction();
    const coins = selectedCoins.map((coin) => coin.objectId);

    const processedCoin = processCoins(tx, tokenAddress, coins);

    const splitedCoins = tx.splitCoins(tx.object(processedCoin), [total]);

    // Transfer coins to the recipient
    tx.transferObjects([splitedCoins[0]], to);
    if (agent.keypair) {
      const result = await agent.suiClient.signAndExecuteTransaction({
        signer: agent.keypair,
        transaction: tx,
      });

      return JSON.stringify({
        status: 'success',
        message: `Transfer completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL + result.digest}`,
        transaction: result.transaction,
      });
    } else if (agent.walletAddress) {
      tx.setSender(agent.walletAddress);
      const txBytes = await tx.build({ client: agent.suiClient });
      return JSON.stringify({
        status: 'success',
        message: 'Transaction setup completed successfully. Please sign and execute the transaction',
        txBytes: Buffer.from(txBytes).toString('hex'),
      });
    } else {
      throw new Error('No private key or wallet address provided');
    }
  } catch (error: any) {
    console.error(
      'Error transferring:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to transfer: ${error.message}`);
  }
}

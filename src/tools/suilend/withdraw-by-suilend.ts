import { SuiAgentKit } from '../../agent';
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
  initializeSuilend,
} from '@suilend/sdk';
import { Transaction } from '@mysten/sui/transactions';
import { SUIVISION_URL } from '../../constants';
import { getCoinAmount } from '../../utils/get-coin-amount';

/**
 * Withdraws a specified amount of a given coin type from Suilend and sends it to the user's address.
 *
 * @param agent - The SuiAgentKit instance containing the Sui client and wallet information.
 * @param coinType - The type of coin to withdraw.
 * @param amount - The amount of the coin to withdraw.
 * @returns A promise that resolves to a string containing the transaction details.
 * @throws Will throw an error if the obligation is not found, the coin type is invalid, or if there is an issue with the withdrawal process.
 */
export async function withdrawBySuilend(
  agent: SuiAgentKit,
  coinType: string,
  amount: number
): Promise<string> {
  try {
    if (!agent.walletAddress) {
      throw new Error('Wallet not connected');
    }

    const suilendClient = await SuilendClient.initialize(
      LENDING_MARKET_ID,
      LENDING_MARKET_TYPE,
      agent.suiClient
    );

    const { coinMetadataMap, obligationOwnerCaps, obligations } =
      await initializeSuilend(
        agent.suiClient,
        suilendClient,
        agent.walletAddress
      );

    if (!obligationOwnerCaps || !obligations) {
      throw new Error('Obligation not found');
    }

    if (!coinMetadataMap[coinType]) {
      throw new Error(`Invalid coin type: ${coinType}`);
    }

    const total = await getCoinAmount(agent, amount, coinType);

    const tx = new Transaction();

    await suilendClient.withdrawAndSendToUser(
      agent.walletAddress,
      obligationOwnerCaps[0].id,
      obligations[0].id,
      coinType,
      total.toString(),
      tx
    );

    if (agent.keypair) {
      const result = await agent.suiClient.signAndExecuteTransaction({
        signer: agent.keypair,
        transaction: tx,
      });

      return JSON.stringify({
        status: 'success',
        message: `Withdraw completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL + result.digest}`,
        transaction: result.transaction,
      });
    } else {
      tx.setSender(agent.walletAddress);
      const txBytes = await tx.build({ client: agent.suiClient });
      return JSON.stringify({
        status: 'success',
        message: 'Withdraw transaction prepared successfully',
        txBytes: Buffer.from(txBytes).toString('hex'),
      });
    }
  } catch (error: any) {
    console.error(
      'Error withdrawing:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to withdraw: ${error.message}`);
  }
}

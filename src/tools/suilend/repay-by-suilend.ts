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
 * Repays a specified amount of a given coin type using the Suilend protocol.
 *
 * @param agent - The SuiAgentKit instance containing the Sui client and wallet information.
 * @param coinType - The type of coin to be repaid.
 * @param amount - The amount of the coin to be repaid.
 * @returns A promise that resolves to a string containing the transaction details.
 * @throws Will throw an error if the obligation or coin metadata is not found, or if the repayment fails.
 */
export async function repayBySuilend(
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

    await suilendClient.repayIntoObligation(
      agent.walletAddress,
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
        message: `Repay completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL + result.digest}`,
        transaction: result.transaction,
      });
    } else {
      tx.setSender(agent.walletAddress);
      const txBytes = await tx.build({ client: agent.suiClient });
      return JSON.stringify({
        status: 'success',
        message: 'Repay transaction prepared successfully',
        txBytes: Buffer.from(txBytes).toString('hex'),
      });
    }
  } catch (error: any) {
    console.error(
      'Error repaying:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to repay: ${error.message}`);
  }
}

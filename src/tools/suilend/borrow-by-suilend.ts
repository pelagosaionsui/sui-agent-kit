import { SuiAgentKit } from '../../agent';
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
  initializeSuilend,
} from '@suilend/sdk';
import { Transaction } from '@mysten/sui/transactions';
import { SUIVISION_URL } from '../../constants';

/**
 * Borrow assets using Suilend.
 *
 * @param agent - The SuiAgentKit instance.
 * @param coinType - The type of coin to borrow.
 * @param amount - The amount of the coin to borrow.
 * @returns A promise that resolves to a string containing the transaction details.
 * @throws Will throw an error if the borrowing process fails.
 */
export async function borrowBySuilend(
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

    const fromCoinAddressMetadata = await agent.suiClient.getCoinMetadata({
      coinType: coinType,
    });

    if (!fromCoinAddressMetadata) {
      throw new Error(`Failed to fetch metadata for coin type: ${coinType}`);
    }

    const total = BigInt(amount * 10 ** fromCoinAddressMetadata.decimals);

    const tx = new Transaction();

    await suilendClient.borrowAndSendToUser(
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
        message: `Borrow completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL + result.digest}`,
        transaction: result.transaction,
      });
    } else {
      tx.setSender(agent.walletAddress);
      const txBytes = await tx.build({ client: agent.suiClient });
      return JSON.stringify({
        status: 'success',
        message: 'Borrow transaction prepared successfully',
        txBytes: Buffer.from(txBytes).toString('hex'),
      });
    }
  } catch (error: any) {
    console.error(
      'Error borrowing:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to borrow: ${error.message}`);
  }
}

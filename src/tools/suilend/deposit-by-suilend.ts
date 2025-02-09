import { SuiAgentKit } from '../../agent';
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
  initializeSuilend,
  createObligationIfNoneExists,
  sendObligationToUser,
} from '@suilend/sdk';
import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { SUIVISION_URL } from '../../constants';
import { getCoinAmount } from '../../utils/get-coin-amount';

/**
 * Deposits a specified amount of a given coin type into the Suilend platform.
 *
 * @param {SuiAgentKit} agent - The Sui agent kit instance.
 * @param {string} coinType - The type of coin to deposit.
 * @param {number} amount - The amount of the coin to deposit.
 * @returns {Promise<string>} - A promise that resolves to a string containing the transaction result.
 * @throws {Error} - Throws an error if the deposit fails.
 */
export async function depositBySuilend(
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

    const { coinMetadataMap, obligationOwnerCaps } = await initializeSuilend(
      agent.suiClient,
      suilendClient,
      agent.walletAddress
    );

    if (!coinMetadataMap[coinType]) {
      throw new Error(`Invalid coin type: ${coinType}`);
    }

    const total = await getCoinAmount(agent, amount, coinType);

    // Deposit
    const tx = new Transaction();

    const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
      suilendClient,
      tx,
      obligationOwnerCaps?.[0],
    );

    await suilendClient.depositIntoObligation(
      agent.walletAddress,
      coinType,
      total.toString(),
      tx,
      obligationOwnerCapId
    );

    if (didCreate) {
      sendObligationToUser(obligationOwnerCapId, agent.walletAddress, tx);
    }

    if (agent.keypair) {
      const result = await agent.suiClient.signAndExecuteTransaction({
        signer: agent.keypair,
        transaction: tx,
      });

      return JSON.stringify({
        status: 'success',
        message: `Deposit completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL + result.digest}`,
        transaction: result.transaction,
      });
    } else {
      tx.setSender(agent.walletAddress);
      const txBytes = await tx.build({ client: agent.suiClient });
      return JSON.stringify({
        status: 'success',
        message: `Deposit prepared successfully.`,
        txbytes: Buffer.from(txBytes).toString('hex'),
      });
    }
  } catch (error: any) {
    console.error(
      'Error depositing:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to deposit: ${error.message}`);
  }
}

/**
 * Creates an obligation if it does not already exist. Obligation object is a must for depositing into the lending market.
 *
 * This function creates a new transaction and an obligation using the provided
 * `suilendClient`. It then transfers the obligation to the agent's wallet address
 * and signs and executes the transaction using the agent's Sui client.
 *
 * @param agent - The SuiAgentKit instance representing the agent.
 * @param suilendClient - The SuilendClient instance used to create the obligation.
 * @returns A promise that resolves when the transaction is signed and executed.
 */
async function createObligationIfNotExists(
  agent: SuiAgentKit,
  suilendClient: SuilendClient
): Promise<void> {
  if (!agent.walletAddress) {
    throw new Error('Wallet address not set');
  }

  const tx = new Transaction();
  const obligation = suilendClient.createObligation(tx);

  tx.transferObjects([obligation], tx.pure.address(agent.walletAddress));

  if (agent.keypair) {
    await agent.suiClient.signAndExecuteTransaction({
      signer: agent.keypair,
      transaction: tx,
    });
  }
}

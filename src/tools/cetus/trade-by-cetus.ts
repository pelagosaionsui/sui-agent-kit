import { AggregatorClient } from '@cetusprotocol/aggregator-sdk';
import { SuiAgentKit } from '../../agent';
import { Transaction } from '@mysten/sui/transactions';
import { CETUS_AGGREGATOR_API, SUIVISION_URL, TOKENS } from '../../constants';
import { Env } from '@cetusprotocol/aggregator-sdk';
import BN from 'bn.js';
import { getCoinAmount } from '../../utils/get-coin-amount';

/**
 * Executes a trade using the Cetus aggregator client.
 *
 * @param {SuiAgentKit} agent - The Sui agent kit instance.
 * @param {string} target - The target coin type to trade to.
 * @param {number} amount - The amount to trade.
 * @param {string} [from=TOKENS.SUI] - The source coin type to trade from. Defaults to SUI.
 * @param {boolean} [byAmountIn=true] - True means fixed the amount of input, false means fixed the amount of output
 * @returns {Promise<string>} - A promise that resolves to a success message or throws an error if the trade fails.
 * @throws {Error} - Throws an error if the trade fails.
 */
export async function tradeByCetus(
  agent: SuiAgentKit,
  target: string,
  amount: number,
  from: string = TOKENS.SUI,
  byAmountIn: boolean = true
): Promise<string> {
  try {
    if (!agent.walletAddress) {
      throw new Error('Wallet not connected');
    }

    const total = await getCoinAmount(agent, amount, from);

    const aggregatorClient = new AggregatorClient(
      CETUS_AGGREGATOR_API,
      agent.walletAddress,
      agent.suiClient,
      Env.Mainnet
    );

    const routers = await aggregatorClient.findRouters({
      from,
      target,
      amount: new BN(total.toString()),
      byAmountIn,
    });

    const tx = new Transaction();

    if (routers != null) {
      if (routers.error) {
        throw new Error(`Routers failed for errors: ${routers.error}`);
      }

      await aggregatorClient.fastRouterSwap({
        routers,
        slippage: 0.01,
        txb: tx,
      });

      let result = await aggregatorClient.devInspectTransactionBlock(tx);

      if (result.effects.status.status === 'success') {
        if (agent.keypair) {
          const result = await aggregatorClient.signAndExecuteTransaction(
            tx,
            agent.keypair
          );
          return JSON.stringify({
            status: 'success',
            message: `Trade completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL + result.digest}`,
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
          const errorMessage =
            'Trade failed. Wallet not connected or keypair not provided';
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        const errorMessage =
          'Trade failed. Cetus aggregator client failed to execute transaction';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } else {
      const errorMessage =
        'Trade failed. Cetus aggregator client could not find routers';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error(
      'Error trading:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Swap failed: ${error.message}`);
  }
}

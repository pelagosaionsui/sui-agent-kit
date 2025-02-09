import {
  LstClient,
  LIQUID_STAKING_INFO_MAP,
  LstId,
  LiquidStakingObjectInfo,
} from '@suilend/springsui-sdk';
import { SuiAgentKit } from '../../agent';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI, SUIVISION_URL } from '../../constants';

/**
 * Stakes a specified amount of tokens using the provided SuiAgentKit.
 *
 * @param {SuiAgentKit} agent - The SuiAgentKit instance to use for staking.
 * @param {number} amount - The amount of SUI to stake.
 * @param {string} lstTokenAddress - The address of the LST token to return. If not provided, defaults to stake into sSUI and return.
 * @returns {Promise<string>} A promise that resolves to a JSON string containing the status, message, and transaction details.
 * @throws {Error} If the staking process fails, an error is thrown with a message indicating the failure reason.
 */
export async function stakeBySpringsui(
  agent: SuiAgentKit,
  amount: number,
  lstTokenAddress: string
): Promise<string> {
  try {
    if (!agent.walletAddress) {
      throw new Error('Wallet not connected');
    }

    let lsdId: LstId | undefined;
    for (const lstId in LIQUID_STAKING_INFO_MAP) {
      if (LIQUID_STAKING_INFO_MAP[lstId as LstId].type === lstTokenAddress) {
        lsdId = lstId as LstId;
        break;
      }
    }

    if (!lsdId) {
      lsdId = LstId.sSUI;
      console.log('No lst token address provided, defaulting to stake sSUI');
    }

    const lstClient = await LstClient.initialize(
      agent.suiClient as any,
      LIQUID_STAKING_INFO_MAP[lsdId] as LiquidStakingObjectInfo
    );
    const tx = new Transaction();

    const [sui] = tx.splitCoins(tx.gas, [BigInt(amount * MIST_PER_SUI)]);
    const sSui = lstClient.mint(tx, sui);

    tx.transferObjects([sSui], agent.walletAddress);

    if (agent.keypair) {
      const result = await agent.suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: agent.keypair,
        options: {
          showEvents: true,
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return JSON.stringify({
        status: 'success',
        message: `Stake completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL + result.digest}`,
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
      throw new Error('No keypair or wallet address found');
    }
  } catch (error: any) {
    console.error(
      'Error staking:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to stake: ${error.message}`);
  }
}

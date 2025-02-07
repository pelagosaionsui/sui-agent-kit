import {
  LstClient,
  LIQUID_STAKING_INFO_MAP,
  LstId,
  LiquidStakingObjectInfo,
} from '@suilend/springsui-sdk';
import { SuiAgentKit } from '../../agent';
import { Transaction } from '@mysten/sui/transactions';
import { SUIVISION_URL } from '../../constants';
import { getCoinsFromWallet } from '../../utils/get-coins-from-wallet';
import { processCoins } from '../../utils/process-coins';
import { getCoinAmount } from '../../utils/get-coin-amount';

export async function unstakeBySpringsui(
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
      lstTokenAddress = LIQUID_STAKING_INFO_MAP[lsdId].type;
      console.log('No lst token address provided, defaulting to unstake sSUI');
    }

    const lstClient = await LstClient.initialize(
      agent.suiClient as any,
      LIQUID_STAKING_INFO_MAP[lsdId] as LiquidStakingObjectInfo
    );

    const total = await getCoinAmount(agent, amount, lstTokenAddress);
    
    // Get coins from the wallet
    const selectedCoins = await getCoinsFromWallet(agent, lstTokenAddress, total);
    
    if (!selectedCoins.length) {
      throw new Error(`Insufficient balance of ${lstTokenAddress}`);
    }
    
    // Process coins including merge and split
    const tx = new Transaction();
    const coins = selectedCoins.map((coin) => coin.objectId);

    const processedCoin = processCoins(tx, lstTokenAddress, coins);
    const [splitedCoins] = tx.splitCoins(tx.object(processedCoin), [total]);

    const sui = lstClient.redeem(tx, splitedCoins);

    tx.transferObjects([sui], agent.walletAddress);

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
        message: 'Unstake completed successfully',
        transaction: result.transaction,
      });
    } else if (agent.walletAddress) {
      tx.setSender(agent.walletAddress);
      const txBytes = await tx.build({ client: agent.suiClient });

      return JSON.stringify({
        status: 'success',
        message: 'Unstake completed successfully',
        txBytes: Buffer.from(txBytes).toString('hex'),
      });
    } else {
      throw new Error('No keypair or wallet address found');
    }
  } catch (error: any) {
    console.error(
      'Error unstaking:',
      error.message,
      'Error stack trace:',
      error.stack
    );
    throw new Error(`Failed to unstake: ${error.message}`);
  }
}

import { AggregatorClient } from "@cetusprotocol/aggregator-sdk"
import { SuiAgentKit } from "../../agent";
import { Transaction } from '@mysten/sui/transactions';
import { CETUS_AGGREGATOR_API, TOKENS } from "../../constants"
import { Env } from "@cetusprotocol/aggregator-sdk"
import BN from "bn.js";

/**
 * 
 * @param agent The SuiAgentKit instance 
 * @param target The coin type of output coin.
 * @param amount The amount of input or output,determined byAmountIn
 * @param from The coin type of input coin.
 * @param byAmountIn True means fixed the amount of input, false means fixed the amount of output
 * @returns String indicating the status of the trade
 */
export async function trade(
    agent: SuiAgentKit,
    target: string,
    amount: number,
    from: string = TOKENS.SUI,
    byAmountIn: boolean = true,
  ): Promise<string> {
    try {
        const fromCoinAddressMetadata = await agent.suiClient.getCoinMetadata({coinType: from});
        
        if (!fromCoinAddressMetadata) {
            throw new Error(`Invalid from coin address: ${from}`);
        }

        const total = new BN(amount).mul(new BN(10).pow(new BN(fromCoinAddressMetadata.decimals)));
        const aggregatorClient = new AggregatorClient(CETUS_AGGREGATOR_API, agent.wallet_address.toSuiAddress(), agent.suiClient, Env.Mainnet);

        const routerRes = await aggregatorClient.findRouters({
            from,
            target,
            amount: total,
            byAmountIn,
        });

        const routerTx = new Transaction();

        if (routerRes != null) {
            await aggregatorClient.fastRouterSwap({
                routers: routerRes.routes,
                byAmountIn,
                txb: routerTx,
                slippage: 0.01,
                refreshAllCoins: true,
            })

            let result = await aggregatorClient.devInspectTransactionBlock(routerTx)

            if (result.effects.status.status === "success") {
                await aggregatorClient.signAndExecuteTransaction(routerTx, agent.wallet)
                return "Trade executed successfully";
            } else {
                console.error("Transaction failed")
                throw new Error("Trade failed. Cetus aggregator client failed to execute transaction")
            }
        } else {
            return "Trade failed. Cetus aggregator client could not find routers";
        }
    } catch (error: any) {
        console.error('Error trading:', error.message, 'Error stack trace:', error.stack);
        throw new Error(`Swap failed: ${error.message}`);
    }
  }
  
import { AggregatorClient } from "@cetusprotocol/aggregator-sdk"
import { SuiAgentKit } from "../../agent";
import { Transaction } from '@mysten/sui/transactions';
import { CETUS_AGGREGATOR_API, TOKENS } from "../../constants"
import { Env } from "@cetusprotocol/aggregator-sdk"
import BN from "bn.js";

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

        const total = new BN(amount * (10 ** fromCoinAddressMetadata.decimals));
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
  
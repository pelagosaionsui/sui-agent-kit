import { SuiAgentKit } from "../../agent";
import { SUIVISION_URL, TOKENS } from "../../constants"
import { buildSwapPTBFromQuote, NAVISDKClient, SignAndSubmitTXB } from "navi-sdk";
import { getCoinsFromWallet } from "../../utils/get-coins-from-wallet";
import { Transaction } from "@mysten/sui/transactions";
import { processCoins } from "../../utils/process-coins";

/**
 * Executes a trade using the Navi aggregator client.
 *
 * @param {SuiAgentKit} agent - The Sui agent kit instance.
 * @param {string} target - The target coin type to trade to.
 * @param {number} amount - The amount of the source coin to trade.
 * @param {string} [from=TOKENS.SUI] - The source coin type to trade from. Defaults to SUI.
 * @returns {Promise<string>} - A promise that resolves to a JSON string containing the trade status and transaction details.
 * @throws {Error} - Throws an error if the trade fails or if there are insufficient funds.
 */
export async function tradeByNavi(
    agent: SuiAgentKit,
    target: string,
    amount: number,
    from: string = TOKENS.SUI,
  ): Promise<string> {
    try {
        const fromCoinAddressMetadata = await agent.suiClient.getCoinMetadata({coinType: from});
        
        if (!fromCoinAddressMetadata) {
            throw new Error(`Invalid from coin address: ${from}`);
        }

        const total = BigInt(amount * (10 ** fromCoinAddressMetadata.decimals));
        const aggregatorClient = new NAVISDKClient({privateKeyList: [agent.wallet.getSecretKey()]});

        // Get coins from the wallet
        const selectedCoins = await getCoinsFromWallet(agent, from, total);

        if (!selectedCoins.length) {
            throw new Error(`Insufficient balance of ${from}`);
        }

        const tx = new Transaction();
        const coins = selectedCoins.map((coin) => coin.objectId);

        const coinObject = processCoins(tx, from, coins); 
        const coinIn = tx.splitCoins(coinObject, [
            tx.pure.u64(total),
        ]);

        //get quote
        const quote = await aggregatorClient.getQuote(from, target, total);
        
        const coinOut = await buildSwapPTBFromQuote(agent.wallet.toSuiAddress(), tx, 0, coinIn, quote);

        tx.transferObjects([coinOut], agent.wallet.toSuiAddress());

        const result = await SignAndSubmitTXB(tx, agent.suiClient, agent.wallet);

        if (result) {
            return JSON.stringify({
                status: "success",
                message: `Trade completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL+result.digest}`,
                transaction: result.transaction,
            });
        } else {
            const errorMessage = "Trade failed. Navi aggregator client failed to execute transaction";
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error: any) {
        console.error('Error trading:', error.message, 'Error stack trace:', error.stack);
        throw new Error(`Swap failed: ${error.message}`);
    }
}
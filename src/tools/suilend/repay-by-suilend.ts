import { SuiAgentKit } from "../../agent";
import {
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    SuilendClient,
    initializeSuilend,
} from "@suilend/sdk";
import { Transaction } from '@mysten/sui/transactions';
import { SUIVISION_URL } from "../../constants";

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
    amount: number,
): Promise<string> {
    try {
        const suilendClient = await SuilendClient.initialize(
            LENDING_MARKET_ID,
            LENDING_MARKET_TYPE,
            agent.suiClient,
        );

        const {
            coinMetadataMap,
            obligationOwnerCaps,
            obligations,
        } = await initializeSuilend(agent.suiClient, suilendClient, agent.walletAddress.toSuiAddress());

        if (!obligationOwnerCaps || !obligations) {
            throw new Error("Obligation not found");
        }

        if (!coinMetadataMap[coinType]) {
            throw new Error(`Invalid coin type: ${coinType}`);
        }

        const fromCoinAddressMetadata = await agent.suiClient.getCoinMetadata({coinType: coinType});
        
        if (!fromCoinAddressMetadata) {
            throw new Error(`Failed to fetch metadata for coin type: ${coinType}`);
        }

        const total = BigInt(amount * (10 ** fromCoinAddressMetadata.decimals));

        const tx = new Transaction();

        await suilendClient.repayIntoObligation(
            agent.walletAddress.toSuiAddress(),
            obligations[0].id,
            coinType,
            total.toString(),
            tx,
        );
        
        const result = await agent.suiClient.signAndExecuteTransaction({ signer: agent.wallet, transaction: tx });

        return JSON.stringify({
            status: "success",
            message: `Repay completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL+result.digest}`,
            transaction: result.transaction,
        });
    } catch (error: any) {
        console.error('Error repaying:', error.message, 'Error stack trace:', error.stack);
        throw new Error(`Failed to repay: ${error.message}`);
    }
}
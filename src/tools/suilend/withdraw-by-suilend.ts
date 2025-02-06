import { SuiAgentKit } from "../../agent";
import {
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    SuilendClient,
    initializeSuilend,
} from "@suilend/sdk";
import { Transaction } from '@mysten/sui/transactions';
import { SUIVISION_URL } from "../../constants";

export async function withdrawBySuilend(
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

        await suilendClient.withdrawAndSendToUser(
            agent.walletAddress.toSuiAddress(),
            obligationOwnerCaps[0].id,
            obligations[0].id,
            coinType,
            total.toString(),
            tx,
        );
        
        const result = await agent.suiClient.signAndExecuteTransaction({ signer: agent.wallet, transaction: tx });

        return JSON.stringify({
            status: "success",
            message: `Withdraw completed successfully. Refer to transaction in SuiVision ${SUIVISION_URL+result.digest}`,
            transaction: result.transaction,
        });
    } catch (error: any) {
        console.error('Error withdrawing:', error.message, 'Error stack trace:', error.stack);
        throw new Error(`Failed to withdraw: ${error.message}`);
    }
}
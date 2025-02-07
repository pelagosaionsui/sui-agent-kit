import { SuiAgentKit } from "../agent";

/**
 * Retrieves the coin amount in the smallest unit based on the token's metadata.
 *
 * @param agent - An instance of SuiAgentKit used to interact with the Sui blockchain.
 * @param amount - The amount of the token in its standard unit.
 * @param tokenAddress - The address of the token for which the amount is being calculated.
 * @returns A promise that resolves to the amount in the smallest unit (as a bigint).
 * @throws Will throw an error if the token address is invalid.
 */
export async function getCoinAmount(agent: SuiAgentKit, amount: number, tokenAddress: string): Promise<bigint> {
  const fromCoinAddressMetadata = await agent.suiClient.getCoinMetadata({
    coinType: tokenAddress,
  });
  
  if (!fromCoinAddressMetadata) {
    throw new Error(`Invalid from coin address: ${tokenAddress}`);
  }

  return BigInt(amount * (10 ** fromCoinAddressMetadata.decimals));
}
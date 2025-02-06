import { SuiAgentKit } from '../agent';

/**
 * Retrieves a list of info of coin objects from a wallet until the specified total amount is reached.
 *
 * e.g. for a single coin object, we may have multiple coin objects with different balances.
 *
 * @param agent - An instance of SuiAgentKit used to interact with the Sui blockchain.
 * @param token_address - The address of the token to retrieve coins for.
 * @param total - The total amount of coins to retrieve.
 * @returns A promise that resolves to an array of selected coins, each containing:
 *   - objectId: The ID of the coin object.
 *   - digest: The digest of the coin object.
 *   - version: The version of the coin object.
 *   - balance: The balance of the coin object.
 */
export async function getCoinsFromWallet(
  agent: SuiAgentKit,
  token_address: string,
  total: bigint
) {
  const selectedCoins: {
    objectId: string;
    digest: string;
    version: string;
    balance: string;
  }[] = [];

  let totalAmount = BigInt(0);
  let hasNext = true;
  let nextCursor: string | null | undefined = null;

  while (hasNext && totalAmount < total) {
    const coins = await agent.suiClient.getCoins({
      owner: agent.walletAddress!,
      coinType: token_address,
      cursor: nextCursor,
    });

    coins.data.sort((a, b) => parseInt(b.balance) - parseInt(a.balance));

    for (const coinData of coins.data) {
      selectedCoins.push({
        objectId: coinData.coinObjectId,
        digest: coinData.digest,
        version: coinData.version,
        balance: coinData.balance,
      });
      totalAmount += BigInt(coinData.balance);
      if (totalAmount >= total) {
        break;
      }
    }

    nextCursor = coins.nextCursor;
    hasNext = coins.hasNextPage;
  }

  return selectedCoins;
}

/**
 * Fetches token data from DexScreener using the token address.
 * 
 * @param tokenAddress - The address of the token to fetch data for.
 * @returns A promise that resolves to the token data as a JSON string.
 * @throws An error if the token address is not provided or if the fetch operation fails.
 */
export async function getTokenDataByAddress(
  tokenAddress: string
): Promise<any> {
  try {
    if (!tokenAddress) {
      throw new Error("Token is required for fetching token data");
    }

    const response = await fetch(`https://api.dexscreener.com/tokens/v1/sui/${tokenAddress}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  } catch (error: any) {
    throw new Error(`Error fetching token data by address from DexScreener: ${error.message}`);
  }
}

/**
 * Fetches token data from DexScreener using the token ticker symbol.
 * 
 * @param ticker - The ticker symbol of the token to fetch data for.
 * @returns A promise that resolves to the token data as a JSON string.
 * @throws An error if the token address cannot be found or if the fetch operation fails.
 */
export async function getTokenDataByTicker(
  ticker: string
): Promise<any> {
  const address = await getTokenAddressFromTicker(ticker);
  if (!address) {
    throw new Error(`Token address not found for ticker: ${ticker}`);
  }

  return getTokenDataByAddress(address);
}

/**
 * Retrieves the token address from DexScreener using the token ticker symbol.
 * 
 * @param ticker - The ticker symbol of the token to find the address for.
 * @returns A promise that resolves to the token address as a string, or null if not found.
 * @throws An error if the fetch operation fails.
 */
export async function getTokenAddressFromTicker(
  ticker: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${ticker}`,
    );
    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return "";
    }

    // Filter for Sui pairs only and sort by FDV
    let suiPairs = data.pairs
      .filter((pair: any) => pair.chainId === "sui")
      .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0));

      suiPairs = suiPairs.filter(
      (pair: any) =>
        pair.baseToken.symbol.toLowerCase() === ticker.toLowerCase(),
    );
    console.log("suiPairs", suiPairs);
    // Return the address of the highest FDV Sui pair
    return suiPairs[0].baseToken.address;
  } catch (error: any) {
    throw new Error(`Error fetching token address based on ticker from DexScreener: ${error.message}`);
  }
}

import BigNumber from "bignumber.js";
import { HERMES_SERVICE_URL } from "../../constants";
import { PythPriceFeedIDItem } from "../../types";

/**
 * Fetches the Pyth price feed ID for a given cryptocurrency ticker symbol.
 * 
 * This function queries the Pyth Hermes Service API to find the price feed ID
 * associated with a cryptocurrency. If multiple feeds are found, it filters
 * for an exact match on the base asset ticker.
 *
 * @param ticker - The cryptocurrency ticker symbol to look up (e.g. "LOFI", "SEND")
 * @returns A promise that resolves to the Pyth price feed ID as a string
 * @throws {Error} If no price feed is found for the ticker or if the API request fails
 *
 * @example
 * ```typescript
 * const pythFeedId = await fetchPythPriceFeedID("LOFI");
 * // Returns something like "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
 * ```
 */
export async function fetchPythPriceFeedID(
  ticker: string,
): Promise<string> {
  try {
    const response = await fetch(
      `${HERMES_SERVICE_URL}/v2/price_feeds?query=${ticker}&asset_type=crypto`,
    );

    if (!response.ok) {
      throw new Error(`Pyth Hermes Service HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error(`No price feed found for ${ticker} on Pyth`);
    }

    if (data.length > 1) {
      const filteredData = data.filter(
        (item: PythPriceFeedIDItem) =>
          item.attributes.base.toLowerCase() === ticker.toLowerCase(),
      );

      if (filteredData.length === 0) {
        throw new Error(`No price feed found for ${ticker} on Pyth`);
      }

      return filteredData[0].id;
    }

    return data[0].id;
  } catch (error: any) {
    throw new Error(
      `Fetching price feed ID from Pyth failed: ${error.message}`,
    );
  }
}

/**
 * Fetches the latest price for a given Pyth price feed ID.
 * 
 * This function queries the Pyth Hermes Service API to retrieve the latest price
 * data for a specified feed ID. It processes the response to extract and calculate
 * the price using the provided exponent.
 *
 * @param feedID - The Pyth price feed ID to look up
 * @returns A promise that resolves to the calculated price as a string
 * @throws {Error} If no price data is found for the feed ID or if the API request fails
 *
 * @example
 * ```typescript
 * const price = await fetchPythPrice("ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace");
 * // Returns a string representation of the price
 * ```
 */
export async function fetchPythPrice(feedID: string): Promise<string> {
  try {
    const response = await fetch(
      `${HERMES_SERVICE_URL}/v2/updates/price/latest?ids[]=${feedID}`,
    );

    const data = await response.json();

    const parsedData = data.parsed;

    if (parsedData.length === 0) {
      throw new Error(`No price data found for ${feedID}`);
    }

    const price = BigNumber(parsedData[0].price.price);
    const exponent = parsedData[0].price.expo;

    return calculatePrice(price, exponent);
  } catch (error: any) {
    throw new Error(`Fetching price from Pyth failed: ${error.message}`);
  }
}

/**
 * Fetches the latest EMA (Exponential Moving Average) price for a given Pyth price feed ID.
 * 
 * This function queries the Pyth Hermes Service API to retrieve the latest EMA price
 * data for a specified feed ID. It processes the response to extract and calculate
 * the EMA price using the provided exponent.
 *
 * @param feedID - The Pyth price feed ID to look up
 * @returns A promise that resolves to the calculated EMA price as a string
 * @throws {Error} If no EMA price data is found for the feed ID or if the API request fails
 *
 * @example
 * ```typescript
 * const emaPrice = await fetchPythEMAPrice("ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace");
 * // Returns a string representation of the EMA price
 * ```
 */
export async function fetchPythEMAPrice(feedID: string): Promise<string> {
  try {
    const response = await fetch(
      `${HERMES_SERVICE_URL}/v2/updates/price/latest?ids[]=${feedID}`,
    );

    const data = await response.json();

    const parsedData = data.parsed;

    if (parsedData.length === 0) {
      throw new Error(`No price data found for ${feedID}`);
    }

    const ema_price = BigNumber(parsedData[0].ema_price.price);
    const exponent = parsedData[0].ema_price.expo;

    return calculatePrice(ema_price, exponent);
  } catch (error: any) {
    throw new Error(`Fetching price from Pyth failed: ${error.message}`);
  }
}

/**
 * Calculates the adjusted price based on the given price and exponent.
 * 
 * This function adjusts the price by dividing it by 10 raised to the power of the exponent.
 * If the exponent is negative, it multiplies the price by 10 raised to the absolute value
 * of the exponent.
 *
 * @param price - The price as a BigNumber
 * @param exponent - The exponent to adjust the price
 * @returns A promise that resolves to the adjusted price as a string
 *
 * @example
 * ```typescript
 * const adjustedPrice = await calculatePrice(new BigNumber(123456), -2);
 * // Returns "1234.56"
 * ```
 */
async function calculatePrice(price: BigNumber, exponent: number): Promise<string> {
  if (exponent < 0) {
    const divisor = BigNumber(10).pow(-exponent);
    const adjustedPrice = price.dividedBy(divisor);
    return adjustedPrice.toString();
  }

  const adjustedPrice = price.dividedBy(BigNumber(10).pow(exponent));
  return adjustedPrice.toString();
}
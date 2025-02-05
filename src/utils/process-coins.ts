import { Transaction } from "@mysten/sui/transactions";
import { TOKENS } from "../constants";

/**
 * Processes the given coins and return the transaction object contains the merged coins object.
 *
 * @param tx - The transaction object.
 * @param coin - The coin type to process.
 * @param coinObjects - An array of coin object identifiers.
 * @returns The processed coin object or the gas object if the coin is SUI.
 */
export const processCoins = (
    tx: Transaction,
    coin: string,
    coinObjects: string[],
) => {
    if (coin === TOKENS.SUI || coin === TOKENS.SUI_SHORT_ADDRESS) {
      return tx.gas;
    } else {
      if (coinObjects.length > 1) {
        tx.mergeCoins(
          tx.object(coinObjects[0]),
          coinObjects.slice(1).map(coinObject => tx.object(coinObject)),
        );
      }
      return tx.object(coinObjects[0]);
    }
};
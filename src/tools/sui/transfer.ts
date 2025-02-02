import { SuiAgentKit } from "../../index";
import { Transaction } from '@mysten/sui/transactions';
import { TOKENS } from "../../constants";
import { isValidSuiTokenAddress } from "../../utils/validate-token-address";

/**
 * Transfers a specified amount of tokens from the agent's wallet to a recipient address.
 *
 * @param {SuiAgentKit} agent - The agent instance containing the wallet and client information.
 * @param {string} to - The recipient's address to which the tokens will be transferred.
 * @param {number} amount - The amount of tokens to transfer.
 * @param {string} [token_address] - The optional token address. If not provided, defaults to SUI token address.
 * @returns {Promise<string>} A promise that resolves to a JSON string containing the transfer status and transaction details.
 * @throws {Error} If the token address is invalid, if there is an insufficient balance, or if the transfer fails.
 */
export async function transfer(
  agent: SuiAgentKit,
  to: string,
  amount: number,
  token_address?: string,
): Promise<string> {
  try {
    if (token_address === undefined || token_address) {
        token_address = TOKENS.SUI;
    }
    
    if (!isValidSuiTokenAddress(token_address)) {
      throw new Error(`Invalid token address: ${token_address}`);
    }

    const fromCoinAddressMetadata = await agent.suiClient.getCoinMetadata({coinType: token_address});

    if (!fromCoinAddressMetadata) {
        throw new Error(`Invalid from coin address: ${token_address}`);
    }

    const total = BigInt(amount) * (BigInt(10) ** BigInt(fromCoinAddressMetadata.decimals));

    // Get coins from the wallet
    const selectedCoins = await getCoinsFromWallet(agent, token_address, total);

    if (!selectedCoins.length) {
        throw new Error(`Insufficient balance of ${token_address}`);
    }

    // Process coins including merge and split
    const tx = new Transaction();
    const coins = selectedCoins.map((coin) => coin.objectId);
    const coinObjects = coins.map((coin) => tx.object(coin));

    if (coinObjects.length > 1) {
        tx.mergeCoins(tx.object(coinObjects[0]), coinObjects.slice(1));
    }

    const splitedCoins = tx.splitCoins(tx.object(coinObjects[0]), [total]);
    
    // Transfer coins to the recipient
    tx.transferObjects([splitedCoins[0]], to);
    const result = await agent.suiClient.signAndExecuteTransaction({ signer: agent.wallet, transaction: tx });
    
    return JSON.stringify({
      status: "success",
      message: "Transfer completed successfully",
      transaction: result.transaction,
    });
  } catch (error: any) {
    console.error('Error transferring:', error.message, 'Error stack trace:', error.stack);
    throw new Error(`Failed to transfer: ${error.message}`);
  }
}

// Private helper function to get coins from the wallet
async function getCoinsFromWallet(agent: SuiAgentKit, token_address: string, total: bigint) {
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
    const coins = await agent.suiClient.getCoins({ owner: agent.wallet_address.toSuiAddress(), coinType: token_address, cursor: nextCursor });

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
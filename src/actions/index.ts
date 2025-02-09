import getWalletAddressAction from './agent/get-wallet-address';
import tradeByCetusAction from './cetus/trade-by-cetus';

export const ACTIONS = {
  WALLET_ADDRESS_ACTION: getWalletAddressAction,
  TRADE_BY_CETUS_ACTION: tradeByCetusAction,
};

export type { Action, ActionExample, Handler } from '../types/action';

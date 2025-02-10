import getWalletAddressAction from './agent/get-wallet-address';
import tradeByCetusAction from './cetus/trade-by-cetus';
import tradeByNaviAction from './navi/trade-by-navi';
import transferAction from './sui/transfer';

export const ACTIONS = {
  WALLET_ADDRESS_ACTION: getWalletAddressAction,
  TRADE_BY_CETUS_ACTION: tradeByCetusAction,
  TRADE_BY_NAVI_ACTION: tradeByNaviAction,
  TRANSFER_ACTION: transferAction,
};

export type { Action, ActionExample, Handler } from '../types/action';

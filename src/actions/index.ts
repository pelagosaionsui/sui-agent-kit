import getWalletAddressAction from './agent/get-wallet-address';
import setWalletAddressAction from './agent/set-wallet-address';

export const ACTIONS = {
  WALLET_ADDRESS_ACTION: getWalletAddressAction,
  SET_WALLET_ADDRESS_ACTION: setWalletAddressAction,
};

export type { Action, ActionExample, Handler } from '../types/action';

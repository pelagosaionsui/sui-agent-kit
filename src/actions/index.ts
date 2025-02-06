import getWalletAddressAction from './agent/get-wallet-address';

export const ACTIONS = {
  WALLET_ADDRESS_ACTION: getWalletAddressAction,
};

export type { Action, ActionExample, Handler } from '../types/action';

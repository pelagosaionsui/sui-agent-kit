import { Tool } from 'langchain/tools';
import { SuiAgentKit } from '../../agent';
import { isValidSuiAddress } from '../../utils/validate-token-address';

export class SuiSetWalletAddressTool extends Tool {
  name = 'sui_set_wallet_address';
  description = `Set the wallet address of the agent`;
  constructor(private suiAgentKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<boolean> {
    console.log('wallet address input: ', input);
    if (!isValidSuiAddress(input)) {
      throw new Error('Invalid wallet address');
    }
    return this.suiAgentKit.setWalletAddress(input);
  }
}

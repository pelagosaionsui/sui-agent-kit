import { Tool } from "langchain/tools";
import { SuiAgentKit } from '../../agent';

export class SuiGetWalletAddressTool extends Tool {
    name = "sui_get_wallet_address";
    description = `Get the wallet address of the agent`;
    constructor(private suiAgentKit: SuiAgentKit) {
        super();
    }

    async _call(_input: string): Promise<string> {
        return this.suiAgentKit.walletAddress.toSuiAddress();
    }
}
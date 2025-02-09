import { Action } from '../../types/action';
import { SuiAgentKit } from '../../agent';
import { z } from 'zod';

const getWalletAddressAction: Action = {
  name: 'GET_WALLET_ADDRESS',
  similes: ['wallet address', 'address', 'wallet'],
  description: 'Get wallet address of the agent',
  examples: [
    [
      {
        input: {},
        output: {
          status: 'success',
          address: '0x12fefd0c521cb04e42646034af7812229c44789583a22a358f0f9430fb348990',
        },
        explanation: "The agent's wallet address is 0x12fefd0c521cb04e42646034af7812229c44789583a22a358f0f9430fb348990",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SuiAgentKit) => {
    if (!agent.walletAddress) {
      throw new Error('Wallet not connected');
    }
    return {
      status: 'success',
      address: agent.walletAddress,
    };
  },
};

export default getWalletAddressAction;

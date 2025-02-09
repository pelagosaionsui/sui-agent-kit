'use client';

import { useChat } from 'ai/react';

import { useSuiClient, useWallet } from '@suiet/wallet-kit';
import { JSONValue } from 'ai';
import { toast } from 'react-toastify';
import { Transaction } from '@mysten/sui/transactions';

export default function Chat() {
  const { signAndExecuteTransaction, address } = useWallet();
  const suiClient = useSuiClient();

  const { messages, input, handleInputChange, handleSubmit, addToolResult, setMessages } =
    useChat({
      api: '/api/use-chat-tools',
      maxSteps: 5,
      experimental_prepareRequestBody: ({messages}) => {
        const info = { message: JSON.stringify(messages[messages.length - 1]), requestData: address as JSONValue };
        console.log("experimental_prepareRequestBody");
        console.log(info);
        return info;
      },
      // run client-side tools that are automatically executed:
      onToolCall({ toolCall }) {
        
      },
      onFinish: async (message) => {
        try {
          message.parts?.map(async (part) => {
            if (part.type === 'tool-invocation') {
              if (part.toolInvocation.toolName === 'TRADE_BY_CETUS_ACTION') {
                const toolInvocation = part['toolInvocation'];
                const toolInvocationRes = toolInvocation.state === 'result' ? toolInvocation.result : '';
                const transaction = JSON.parse(toolInvocationRes.transaction);
                if (transaction.txBytes) {
                  try {
                    const bytes = new Uint8Array(
                      Buffer.from(transaction.txBytes, 'hex')
                    );
                    const txn = Transaction.from(bytes);
                    const dryRunResult = await suiClient.dryRunTransactionBlock({
                      transactionBlock: await txn.build({ client: suiClient }),
                    });
                    const result = await signAndExecuteTransaction({
                      transaction: txn,
                    });
                    setMessages((messages) => [
                      ...messages,
                      {
                        id: messages.length.toString(),
                        content: `Transaction executed successfully! Hash: ${result.digest}`,
                        role: 'system',
                      },
                    ]);
                  } catch (e: any) {
                    console.error('Failed to submit transaction: ', e);
                    toast(`Transaction failed: ${e.message || 'Unknown error'}`, {
                      theme: 'dark',
                    });
                  }
                }
              }
            }
          });
        } catch (e: any) {
          console.error('Error processing message:', e);
          toast(`Transaction failed: ${e.message}`, {
            theme: 'dark',
          });
        }
      },
      onError: (e) => {
        toast(e.message, {
          theme: 'dark',
        });
      },
    });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages?.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          <strong>{`${message.role}: `}</strong>
          {message.parts.map(part => {
            switch (part.type) {
              case 'text':
                return part.text;
              case 'tool-invocation': {
                const callId = part.toolInvocation.toolCallId;
                
                // example of partial-call, call, and result handling:

                // switch (part.toolInvocation.toolName) {
                //   case 'TRADE_BY_CETUS_ACTION': {
                //     switch (part.toolInvocation.state) {
                //       // example of pre-rendering streaming tool calls:
                //       case 'partial-call':
                //         console.log('partial-call', part.toolInvocation);
                //         return (
                //           <pre key={callId}>
                //             {JSON.stringify(part.toolInvocation, null, 2)}
                //           </pre>
                //         );
                //       case 'call':
                //         console.log('call', part.toolInvocation);
                //         return (
                //           <div key={callId} className="text-gray-500">
                //             Getting weather information for{' '}
                //             {part.toolInvocation.args.city}...
                //           </div>
                //         );
                //       case 'result':
                //         console.log('result', part.toolInvocation);
                //         return (
                //           <div key={callId} className="text-gray-500">
                //             Weather in {part.toolInvocation.args.city}:{' '}
                //             {part.toolInvocation.result}
                //           </div>
                //         );
                //     }
                //     break;
                //   }
                // }
              }
            }
          })}
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}

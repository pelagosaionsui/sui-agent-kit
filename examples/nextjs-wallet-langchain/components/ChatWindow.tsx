'use client';

import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useChat } from 'ai/react';
import { JSONValue } from 'ai';
import { useRef, useState, ReactElement } from 'react';
import type { FormEvent } from 'react';

import { ChatMessageBubble } from '@/components/ChatMessageBubble';
import { IntermediateStep } from './IntermediateStep';
import { useSuiClient, useWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';

export function ChatWindow(props: {
  endpoint: string;
  emptyStateComponent: ReactElement;
  placeholder?: string;
  titleText?: string;
  emoji?: string;
  showIntermediateStepsToggle?: boolean;
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    endpoint,
    emptyStateComponent,
    placeholder,
    titleText = 'An LLM',
    showIntermediateStepsToggle,
    emoji,
  } = props;

  const [showIntermediateSteps, setShowIntermediateSteps] = useState(false);
  const [intermediateStepsLoading, setIntermediateStepsLoading] =
    useState(false);
  const { signAndExecuteTransaction, address } = useWallet();
  const suiClient = useSuiClient();

  const checkIsJson = (message: string) => {
    return message.match(
    /\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\}/);
  };

  const intemediateStepsToggle = showIntermediateStepsToggle && (
    <div>
      <input
        type="checkbox"
        id="show_intermediate_steps"
        name="show_intermediate_steps"
        checked={showIntermediateSteps}
        onChange={(e) => setShowIntermediateSteps(e.target.checked)}
      ></input>
      <label htmlFor="show_intermediate_steps"> Show intermediate steps</label>
    </div>
  );

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
    setMessages,
  } = useChat({
    api: endpoint,
    onResponse(response) {
      const sourcesHeader = response.headers.get('x-sources');
      const sources = sourcesHeader
        ? JSON.parse(Buffer.from(sourcesHeader, 'base64').toString('utf8'))
        : [];
      const messageIndexHeader = response.headers.get('x-message-index');
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    experimental_prepareRequestBody: ({messages}) => {
      return { message: JSON.stringify(messages[messages.length - 1]), requestData: address as JSONValue };
    },
    onFinish: async (message) => {
      try {
        if (message.role === 'assistant') {
          const match = checkIsJson(message.content)
          if (match) {
            const jsonContent = JSON.parse(match[0]);
            // if message comes from a tool, we try to find txBytes and execute it
            // Note: normally this can be done via onToolCall, but since langchain
            // tool has different interface from vercel ai sdk, we have to do it here
            if (jsonContent.tool_call_id) {
              const content = JSON.parse(jsonContent.content);
              const transaction = JSON.parse(content.transaction);
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
        }
      } catch (e: any) {
        console.error('Error processing message:', e);
        toast(`Transaction failed: ${e.message}`, {
          theme: 'dark',
        });
      }
    },
    streamMode: 'text',
    onError: (e) => {
      toast(e.message, {
        theme: 'dark',
      });
    },
  });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add('grow');
    }
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading ?? intermediateStepsLoading) {
      return;
    }
    if (!showIntermediateSteps) {
      handleSubmit(e);
      // Some extra work to show intermediate steps properly
    } else {
      setIntermediateStepsLoading(true);
      setInput('');
      const messagesWithUserReply = messages.concat({
        id: messages.length.toString(),
        content: input,
        role: 'user',
      });
      setMessages(messagesWithUserReply);
      fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          messages: messagesWithUserReply,
          show_intermediate_steps: true,
        }),
      });
    }
  }

  return (
    <div
      className={`flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden ${
        messages.length > 0 ? 'border' : ''
      }`}
    >
      <h2 className={`${messages.length > 0 ? '' : 'hidden'} text-2xl`}>
        {emoji} {titleText}
      </h2>
      {messages.length === 0 ? emptyStateComponent : ''}
      <div
        className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out"
        ref={messageContainerRef}
      >
        {messages.length > 0
          ? [...messages].reverse().map((m, i) => {
              const sourceKey = (messages.length - 1 - i).toString();
              return m.role === 'system' && checkIsJson(m.content) ? (
                <IntermediateStep key={m.id} message={m}></IntermediateStep>
              ) : (
                <ChatMessageBubble
                  key={m.id}
                  message={m}
                  aiEmoji={emoji}
                  sources={sourcesForMessages[sourceKey]}
                ></ChatMessageBubble>
              );
            })
          : ''}
      </div>
      <form onSubmit={sendMessage} className="flex w-full flex-col">
        <div className="flex">{intemediateStepsToggle}</div>
        <div className="flex w-full mt-4">
          <input
            className="grow mr-8 p-4 rounded"
            value={input}
            placeholder={placeholder ?? "What's it like to be a pirate?"}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="shrink-0 px-8 py-4 bg-primary-600 rounded w-28"
          >
            <div
              role="status"
              className={`${
                chatEndpointIsLoading || intermediateStepsLoading
                  ? ''
                  : 'hidden'
              } flex justify-center`}
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-white animate-spin dark:text-white fill-sky-800"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <span
              className={
                chatEndpointIsLoading || intermediateStepsLoading
                  ? 'hidden'
                  : ''
              }
            >
              Send
            </span>
          </button>
        </div>
      </form>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

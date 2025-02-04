import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";

export const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    isSuiReadQuery: z
      .boolean()
      .describe("Query requires reading data from Sui blockchain"),
    isSuiWriteQuery: z
      .boolean()
      .describe("Query requires writing/modifying data on Sui blockchain"),
    isGeneralQuery: z
      .boolean()
      .describe("Query is about non-blockchain topics"),
  }),
);

export const prompt = PromptTemplate.fromTemplate(
  `
    You are the Chief Routing Officer for a multi-blockchain agent network. Your tasks are:
    1. Analyze and classify incoming queries.
    2. Decide if the query needs Sui read operations, write operations, or is a general query.

    Follow this format for your response:
    {formatInstructions}

    Classification Guidelines:
    - Sui Read Operations:
      * Check account balances
      * Check token prices or holdings
    - Sui Write Operations:
      * Send tokens or SUI
    - General Queries:
      * Non-blockchain topics
      * Internet searches
      * General knowledge questions

    \n {messages} \n
    `,
);

import { tool, type Tool } from "ai";
import { SuiAgentKit } from "../agent";
import { executeAction } from "../utils/action-executor";
import { ACTIONS } from "../actions";

export function createSuiTools(
  suiAgentKit: SuiAgentKit,
): Record<string, Tool> {
  const tools: Record<string, Tool> = {};
  const actionKeys = Object.keys(ACTIONS);

  for (const key of actionKeys) {
    const action = ACTIONS[key as keyof typeof ACTIONS];
    tools[key] = tool({
      // @ts-expect-error Value matches type however TS still shows error
      id: action.name,
      description: `
      ${action.description}

      Similes: ${action.similes.map(
        (simile) => `
        ${simile}
      `,
      )}
      `.slice(0, 1023),
      parameters: action.schema,
      execute: async (params) =>
        await executeAction(action, suiAgentKit, params),
    });
  }

  return tools;
}
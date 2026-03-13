import { WorkflowService } from './workflow-service.js';
import { AgentManager } from '../agent-manager.js';
import { ToolManager } from '../tool-manager.js';
import { loadConfig } from '../config-manager.js';
import { streamChatCompletion, getChatCompletion } from '../llm-provider.js';

export interface WorkflowExecutionResult {
    success: boolean;
    finalResponse: string;
    error?: string;
}

interface StepResult {
    stepName: string;
    toolId: string;
    result: any;
}

/**
 * Collect all tool calls from a streaming LLM response.
 * Returns the assembled tool calls array (same format as agent-loop).
 */
async function collectToolCall(
    llmConfig: any,
    messages: any[],
    toolDef: any
): Promise<{ toolCalls: any[]; textContent: string }> {
    const toolCalls: any[] = [];
    let textContent = '';

    for await (const delta of streamChatCompletion(llmConfig, messages, [toolDef])) {
        if (delta.content) textContent += delta.content;
        if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
                if (!toolCalls[tc.index]) {
                    toolCalls[tc.index] = { ...tc, function: { name: '', arguments: '', ...tc.function } };
                } else {
                    if (tc.id) toolCalls[tc.index].id = tc.id;
                    if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
                    if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
                }
            }
        }
    }

    return { toolCalls: toolCalls.filter(Boolean), textContent };
}

export async function executeWorkflow(workflowId: string, agentId: string): Promise<WorkflowExecutionResult> {
    const workflow = WorkflowService.getWorkflow(workflowId);
    if (!workflow) return { success: false, finalResponse: '', error: 'Workflow not found' };

    const states = WorkflowService.getWorkflowStates(workflowId);
    if (states.length === 0) return { success: false, finalResponse: '', error: 'Workflow has no steps configured' };

    const agent = AgentManager.getAgent(agentId);
    if (!agent) return { success: false, finalResponse: '', error: `Agent "${agentId}" not found` };

    const currentConfig = loadConfig();
    let providerConfig = currentConfig.providers.find(p => p.model === agent.provider || p.description === agent.provider);
    if (!providerConfig && currentConfig.providers.length > 0) providerConfig = currentConfig.providers[0];
    if (!providerConfig) return { success: false, finalResponse: '', error: 'No LLM provider available' };

    const llmConfig = {
        baseUrl: providerConfig.endpoint,
        modelId: providerConfig.model,
        apiKey: providerConfig.apiKey,
        supportsTools: !!providerConfig?.capabilities?.trained_for_tool_use
    };

    const stepResults: StepResult[] = [];

    for (const state of states) {
        let toolId = 'unknown';
        let stepPrompt = state.instructions ?? '';
        try {
            const parsed = JSON.parse(state.instructions ?? '');
            if (parsed.tool_id) toolId = parsed.tool_id;
            if (parsed.prompt !== undefined) stepPrompt = parsed.prompt;
        } catch { /* plain text instructions */ }

        // Find the tool definition so we can restrict the LLM to only this tool
        const allDefs = ToolManager.getToolDefinitions();
        const toolDef = allDefs.find(d => d.name === toolId);

        if (!toolDef) {
            stepResults.push({ stepName: state.name, toolId, result: { error: `Tool "${toolId}" is not available.` } });
            continue;
        }

        // Ask the LLM to interpret the step instructions and produce exactly one tool call.
        // We only pass the single target tool definition, so it cannot call anything else.
        const stepMessages = [
            {
                role: 'system',
                content: `You are executing a single workflow step. Your only job is to call the "${toolId}" tool with the correct parameters extracted from the user's instructions. Do not explain or add commentary — just make the tool call.`
            },
            {
                role: 'user',
                content: stepPrompt || `Call the ${toolId} tool.`
            }
        ];

        let toolArgs: any = {};
        try {
            const { toolCalls } = await collectToolCall(llmConfig, stepMessages, toolDef);
            if (toolCalls.length === 0) {
                stepResults.push({ stepName: state.name, toolId, result: { error: 'LLM did not generate a tool call for this step.' } });
                continue;
            }
            toolArgs = JSON.parse(toolCalls[0].function.arguments || '{}');
        } catch (e: any) {
            stepResults.push({ stepName: state.name, toolId, result: { error: `Failed to parse tool arguments: ${e.message}` } });
            continue;
        }

        // Execute the tool exactly once
        try {
            const result = await ToolManager.callTool(toolId, toolArgs, { agentId });
            stepResults.push({ stepName: state.name, toolId, result });
        } catch (e: any) {
            stepResults.push({ stepName: state.name, toolId, result: { error: e.message } });
        }
    }

    // Final summary: single LLM text call, no tools
    const summaryLines = stepResults.map((r, i) =>
        `Step ${i + 1} — ${r.stepName} (${r.toolId}):\n${JSON.stringify(r.result, null, 2)}`
    ).join('\n\n---\n\n');

    const summaryMessages = [
        { role: 'system', content: agent.systemPrompt },
        {
            role: 'user',
            content: `The workflow "${workflow.name}" has completed. Here are the results from each step:\n\n${summaryLines}\n\nPlease summarize what was accomplished and highlight the key findings.`
        }
    ];

    try {
        const { content: summary } = await getChatCompletion(llmConfig, summaryMessages);
        return { success: true, finalResponse: summary };
    } catch (e: any) {
        // If summary fails, return raw results
        return { success: true, finalResponse: `Workflow completed.\n\n${summaryLines}` };
    }
}

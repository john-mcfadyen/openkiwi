import path from 'node:path';
import { SkillManager } from '../skill-manager.js';

export const activate_skill = {
    definition: {
        name: 'activate_skill',
        displayName: 'Skills: Activate',
        pluginType: 'skill',
        description: 'Load the full instructions for an Agent Skill. Call this when a user task matches one of the available skills listed in the system prompt.',
        parameters: {
            type: 'object' as const,
            properties: {
                skillName: {
                    type: 'string',
                    description: 'The name of the skill to activate (must match a discovered skill name exactly).'
                }
            },
            required: ['skillName']
        }
    },
    handler: async ({ skillName }: { skillName: string }) => {
        const content = SkillManager.getSkillContent(skillName);
        if (!content) {
            const available = SkillManager.getSkillDefinitions().map(s => s.name);
            return {
                error: `Skill '${skillName}' not found. Available skills: ${available.join(', ') || 'none'}.`
            };
        }

        const skillDef = SkillManager.getSkillDefinitions().find(s => s.name === skillName)!;

        const allowedTools = content.metadata['allowed-tools']
            ? content.metadata['allowed-tools'].split(/\s+/).filter(Boolean)
            : [];

        return {
            name: content.metadata.name,
            description: content.metadata.description,
            instructions: content.body,
            allowed_tools: allowedTools.length > 0 ? allowedTools : undefined,
            available_scripts: content.scriptFiles,
            scripts_path: content.scriptFiles.length > 0
                ? path.join(skillDef.skillPath, 'scripts')
                : null,
            available_references: content.referenceFiles,
            available_assets: content.assetFiles
        };
    }
};

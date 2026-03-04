import React from 'react';
import Card from './Card';
import Text from './Text';
import Badge from './Badge';
import Button from './Button';
import Toggle from './Toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';

interface ToolDefinition {
    name: string;
    displayName: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
    filename?: string;
    isRegistered?: boolean;
    hasReadme?: boolean;
}

interface Config {
    chat: {
        showReasoning: boolean;
        includeHistory: boolean;
        generateSummaries: boolean;
        showTokenMetrics: boolean;
    };
    system?: {
        version: string;
        latestVersion: string;
    };
    memory?: {
        useEmbeddings: boolean;
        embeddingsModel: string;
    };
    gateway: {
        port: number;
        endpoint: string;
    };
    global?: {
        systemPrompt: string;
    };
    providers: {
        description: string;
        endpoint: string;
        model: string;
    }[];
    enabledTools?: Record<string, boolean>;
}

interface SkillsAndToolsCardProps {
    tool: ToolDefinition;
    config: Config | null;
    setConfig: (config: Config | null) => void;
    saveConfig: (e?: React.FormEvent, configOverride?: Config) => Promise<void>;
    gatewayAddr: string;
    gatewayToken: string;
    loadingReadme: boolean;
    setLoadingReadme: (loading: boolean) => void;
    setViewingReadme: (readme: { name: string, content: string } | null) => void;
}

const SkillsAndToolsCard: React.FC<SkillsAndToolsCardProps> = ({
    tool,
    config,
    setConfig,
    saveConfig,
    gatewayAddr,
    gatewayToken,
    loadingReadme,
    setLoadingReadme,
    setViewingReadme
}) => {
    const handleReadDocumentation = (e: React.MouseEvent) => {
        e.preventDefault();
        setLoadingReadme(true);
        fetch(`${gatewayAddr.replace(/\/$/, '')}/api/tools/readme?path=${encodeURIComponent(tool.filename!)}`, {
            headers: {
                'Authorization': `Bearer ${gatewayToken}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.content) {
                    const toolDir = tool.filename!.split(/[\/\\]/).slice(0, -1).join('/');
                    const processedContent = data.content
                        .replace(/!\[(.*?)\]\((?!http|https|\/)(.*?)\)/g, (match: string, alt: string, imagePath: string) => {
                            const fullImagePath = toolDir ? `${toolDir}/${imagePath}` : imagePath;
                            return `![${alt}](/api/tools/files?path=${encodeURIComponent(fullImagePath)})`;
                        })
                        .replace(/<img([^>]*)\ssrc=["']((?!http|https|\/)[^"']+)["']([^>]*)>/g, (match: string, before: string, imagePath: string, after: string) => {
                            const fullImagePath = toolDir ? `${toolDir}/${imagePath}` : imagePath;
                            return `<img${before} src="/api/tools/files?path=${encodeURIComponent(fullImagePath)}"${after}>`;
                        });
                    setViewingReadme({ name: tool.name, content: processedContent });
                } else {
                    toast.error("Failed to load README content");
                }
            })
            .catch(err => {
                console.error(err);
                toast.error("Error fetching README");
            })
            .finally(() => setLoadingReadme(false));
    };

    const handleToggle = () => {
        if (!tool.filename || !config) return;
        const filename = tool.filename;
        const enabledStatus = config.enabledTools?.[filename] ?? false;

        const newConfig: Config = {
            ...config,
            enabledTools: {
                ...(config.enabledTools || {}),
                [filename]: !enabledStatus
            }
        };

        setConfig(newConfig);
        saveConfig(undefined, newConfig).then(() => {
            toast.success(`${!enabledStatus ? 'Enabled' : 'Disabled'} ${tool.name}`);
        }).catch(err => {
            toast.error(`Failed to update ${tool.name}`);
            console.error(err);
        });
    };

    return (
        <Card>
            <div key={tool.name}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Text bold={true} size="lg" className="truncate">{tool.displayName || tool.name}</Text>
                        <Badge className="shrink-0">Plugin</Badge>
                    </div>

                    <div className="flex-1 flex justify-center">
                        {tool.hasReadme && tool.filename && (
                            <Button
                                size="sm"
                                icon={faInfoCircle}
                                onClick={handleReadDocumentation}
                                disabled={loadingReadme}
                            >
                                Read Documentation
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center shrink-0">
                        <Toggle
                            checked={tool.filename ? (config?.enabledTools?.[tool.filename] ?? false) : true}
                            onChange={handleToggle}
                            disabled={!tool.filename}
                            title={!tool.filename ? "This is a core system function and cannot be deactivated." : undefined}
                        />
                    </div>
                </div>

                <div>
                    <Text size="sm" secondary={true}>{tool.description}</Text>
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <Text className="uppercase shrink-0" size="xs" bold={true}>Parameters</Text>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(tool.parameters.properties).map(prop => (
                            <Badge key={prop} className="font-mono py-0 text-[10px]">
                                {prop}
                                {tool.parameters.required?.includes(prop) && <span className="text-red-500 ml-0.5">*</span>}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default SkillsAndToolsCard;

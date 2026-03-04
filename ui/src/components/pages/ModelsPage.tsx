
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { faPlus, faKey, faCube, faSave, faRefresh, faAlignLeft, faPencil, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Provider from '../Provider'
import Button from '../Button'
import Modal from '../Modal'
import Card from '../Card'
import Text from '../Text'
import Page from './Page'
import ModelsTable from '../ModelsTable'
import Input from '../Input'
import { Model, Config, Agent } from '../../types'
import GoogleIcon from '../../img/google.png'
import OpenAIIcon from '../../img/openai.svg.png'
import AnthropicIcon from '../../img/anthropic.png'
import LMStudioIcon from '../../img/lmstudio.png'
import OpenRouterIcon from '../../img/openrouter.png'
import OllamaIcon from '../../img/ollama.png'
import LemonadeIcon from '../../img/lemonade.png'
import SectionHeader from '../SectionHeader'
import Row from '../Row'
import Column from '../Column'
import Code from '../Code'

interface ModelsPageProps {
    config: Config | null;
    setConfig: React.Dispatch<React.SetStateAction<Config | null>>;
    models: string[];
    saveConfig: (e?: React.FormEvent, configOverride?: Config) => Promise<void>;
    fetchModels: (isSilent?: boolean, configOverride?: { endpoint: string, apiKey?: string }, skipSetState?: boolean) => Promise<boolean | string[] | Model[] | void>;
    agents: Agent[];
}

const ProviderButton = ({ isSelected, onClick, icon, alt, className = "" }: { isSelected: boolean; onClick: () => void; icon: any; alt: string; className?: string }) => (
    <Button
        className={`h-16 flex-1 min-w-[60px] text-lg font-bold border-2 transition-all ${isSelected ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-divider bg-card hover:bg-surface text-neutral-500'}`}
        onClick={onClick}
    >
        <img src={icon} alt={alt} className={`h-8 ${className}`} />
    </Button>
);

export default function ModelsPage({
    config,
    setConfig,
    models,
    saveConfig,
    fetchModels,
    agents
}: ModelsPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProvider, setNewProvider] = useState<{ description: string; endpoint: string; model: string; capabilities?: { vision?: boolean; reasoning?: boolean; trained_for_tool_use?: boolean } }>({ description: '', endpoint: '', model: '' });
    const [selectedProviderType, setSelectedProviderType] = useState<string | null>(null);
    const [newGeminiProvider, setNewGeminiProvider] = useState({ apiKey: '', model: '', description: '', capabilities: {} as any });
    const [newOpenAIProvider, setNewOpenAIProvider] = useState({ apiKey: '', model: '', description: '', capabilities: {} as any });
    const [newAnthropicProvider, setNewAnthropicProvider] = useState({ apiKey: '', model: '', description: '', capabilities: {} as any });
    const [newOpenRouterProvider, setNewOpenRouterProvider] = useState({ apiKey: '', description: '' });
    const [newLemonadeProvider, setNewLemonadeProvider] = useState({ endpoint: 'http://localhost:8000', model: '', description: '', capabilities: {} as any });
    const [newOllamaProvider, setNewOllamaProvider] = useState({ endpoint: 'http://localhost:11434', model: '', description: '', capabilities: {} as any });
    const [scannedModels, setScannedModels] = useState<Model[]>([]);

    // Editing State
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{ description: string; model: string; endpoint: string; apiKey?: string; capabilities?: { vision?: boolean; reasoning?: boolean; trained_for_tool_use?: boolean } }>({ description: '', model: '', endpoint: '' });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Available Gemini models (hardcoded defaults + dynamic)
    const geminiModels = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite-preview-02-05',
        'gemini-2.0-pro-exp-02-05',
        'gemini-2.0-flash-thinking-exp-01-21',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
    ];

    useEffect(() => {
        if (!isModalOpen) {
            setSelectedProviderType(null);
            setNewProvider({ description: '', endpoint: '', model: '' });
            setNewGeminiProvider({ apiKey: '', model: '', description: '', capabilities: {} });
            setNewOpenAIProvider({ apiKey: '', model: '', description: '', capabilities: {} });
            setNewAnthropicProvider({ apiKey: '', model: '', description: '', capabilities: {} });
            setNewOpenRouterProvider({ apiKey: '', description: '' });
            setNewLemonadeProvider({ endpoint: 'http://localhost:8000', model: '', description: '', capabilities: {} });
            setNewOllamaProvider({ endpoint: 'http://localhost:11434', model: '', description: '', capabilities: {} });
            setScannedModels([]);
        }
    }, [isModalOpen]);

    useEffect(() => {
        setScannedModels([]);
    }, [selectedProviderType]);

    const handleRowClick = (idx: number) => {
        if (!config || !config.providers[idx]) return;
        const provider = config.providers[idx];
        setEditingIndex(idx);
        setEditForm({
            description: provider.description,
            model: provider.model,
            endpoint: provider.endpoint,
            apiKey: provider.apiKey,
            capabilities: provider.capabilities
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProvider = async () => {
        if (!config || editingIndex === null) return;

        const updatedProviders = [...config.providers];
        updatedProviders[editingIndex] = {
            ...updatedProviders[editingIndex],
            description: editForm.description,
            model: editForm.model,
            // Preserve capabilities if not explicitly edited (logic could be expanded if we allowed editing capabilities)
            capabilities: updatedProviders[editingIndex].capabilities
        };

        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Model updated");
        setIsEditModalOpen(false);
    };

    const handleDeleteProvider = async (originalIndex: number) => {
        if (!config) return;
        const updatedProviders = [...config.providers];
        updatedProviders.splice(originalIndex, 1);
        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Model deleted");
    };

    const detectCapabilities = (model: Model) => {
        const modelId = (model.id || "").toLowerCase();
        const displayName = (model.displayName || model.display_name || "").toLowerCase();
        const description = (model.description || "").toLowerCase();

        const isReasoning = model.capabilities?.reasoning ||
            model.thinking === true ||
            modelId.includes("deepseek-r1") ||
            modelId.includes("o1") ||
            modelId.includes("reasoning") ||
            modelId.includes("thinking") ||
            modelId.includes("claude-3-7") ||
            displayName.includes("deepseek-r1") ||
            displayName.includes("o1") ||
            displayName.includes("reasoning") ||
            displayName.includes("thinking") ||
            displayName.includes("claude-3.7");

        const isVision = model.capabilities?.vision ||
            modelId.includes("vision") ||
            modelId.includes("flash") ||
            modelId.includes("pro") ||
            modelId.includes("claude-3") ||
            displayName.includes("vision") ||
            displayName.includes("flash") ||
            displayName.includes("pro") ||
            displayName.includes("claude-3");

        const isTool = model.capabilities?.trained_for_tool_use ||
            modelId.includes("tool") ||
            modelId.includes("flash") ||
            modelId.includes("pro") ||
            modelId.includes("claude-3") ||
            displayName.includes("tool") ||
            displayName.includes("flash") ||
            displayName.includes("pro") ||
            description.includes("tool") ||
            description.includes("claude-3");

        return {
            reasoning: isReasoning || false,
            vision: isVision || false,
            trained_for_tool_use: isTool || false
        };
    };



    const handleGeminiScan = async () => {
        if (!newGeminiProvider.apiKey) {
            toast.error("Please enter an API Key first");
            return;
        }
        const result = await fetchModels(false, {
            endpoint: 'https://generativelanguage.googleapis.com/v1beta',
            apiKey: newGeminiProvider.apiKey
        }, true);
        if (Array.isArray(result)) {
            const models = result.map(m => typeof m === 'string' ? { id: m, object: 'model' } as Model : m);
            setScannedModels(models);
        }
    };

    const handleGeminiSave = async () => {
        if (!config || !newGeminiProvider.apiKey || !newGeminiProvider.model) {
            toast.error("Please provide at least an API Key and select a Model");
            return;
        }

        const providerToAdd = {
            description: newGeminiProvider.description.trim() || `Google Gemini - ${newGeminiProvider.model}`,
            endpoint: 'https://generativelanguage.googleapis.com/v1beta',
            model: newGeminiProvider.model,
            apiKey: newGeminiProvider.apiKey,
            capabilities: newGeminiProvider.capabilities
        };

        const updatedProviders = [...(config.providers || []), providerToAdd];
        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Successfully saved Google Gemini provider");
        setIsModalOpen(false);
        setNewGeminiProvider({ apiKey: '', model: '', description: '', capabilities: {} });
    };

    const handleOpenAIScan = async () => {
        if (!newOpenAIProvider.apiKey) {
            toast.error("Please enter an API Key first");
            return;
        }
        const result = await fetchModels(false, {
            endpoint: 'https://api.openai.com/v1',
            apiKey: newOpenAIProvider.apiKey
        }, true);
        if (Array.isArray(result)) {
            const models = result.map(m => typeof m === 'string' ? { id: m, object: 'model' } as Model : m);
            setScannedModels(models);
        }
    };

    const handleOpenAISave = async () => {
        if (!config || !newOpenAIProvider.apiKey || !newOpenAIProvider.model) {
            toast.error("Please provide at least an API Key and select a Model");
            return;
        }

        const description = newOpenAIProvider.description.trim() || `OpenAI - ${newOpenAIProvider.model}`;

        const providerToAdd = {
            description: description,
            endpoint: 'https://api.openai.com/v1',
            model: newOpenAIProvider.model,
            apiKey: newOpenAIProvider.apiKey,
            capabilities: newOpenAIProvider.capabilities
        };

        const updatedProviders = [...(config.providers || []), providerToAdd];
        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Successfully saved OpenAI provider");
        setIsModalOpen(false);
        setNewOpenAIProvider({ apiKey: '', model: '', description: '', capabilities: {} });
    };

    const handleAnthropicScan = async () => {
        if (!newAnthropicProvider.apiKey) {
            toast.error("Please enter an API Key first");
            return;
        }
        const result = await fetchModels(false, {
            endpoint: 'https://api.anthropic.com/v1',
            apiKey: newAnthropicProvider.apiKey
        }, true);
        if (Array.isArray(result)) {
            const models = result.map(m => typeof m === 'string' ? { id: m, object: 'model' } as Model : m);
            setScannedModels(models);
        }
    };

    const handleAnthropicSave = async () => {
        if (!config || !newAnthropicProvider.apiKey || !newAnthropicProvider.model) {
            toast.error("Please provide at least an API Key and select a Model");
            return;
        }

        const description = newAnthropicProvider.description.trim() || `Anthropic - ${newAnthropicProvider.model}`;

        const providerToAdd = {
            description: description,
            endpoint: 'https://api.anthropic.com/v1',
            model: newAnthropicProvider.model,
            apiKey: newAnthropicProvider.apiKey,
            capabilities: newAnthropicProvider.capabilities
        };

        const updatedProviders = [...(config.providers || []), providerToAdd];
        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Successfully saved Anthropic provider");
        setIsModalOpen(false);
        setNewAnthropicProvider({ apiKey: '', model: '', description: '', capabilities: {} });
    };

    const handleOpenRouterSave = async () => {
        if (!config || !newOpenRouterProvider.apiKey) {
            toast.error("Please provide an API Key");
            return;
        }

        const providerToAdd = {
            description: newOpenRouterProvider.description.trim() || `OpenRouter`,
            endpoint: 'https://openrouter.ai/api/v1',
            model: 'openrouter/auto', // Default placeholder
            apiKey: newOpenRouterProvider.apiKey,
            capabilities: { vision: true, reasoning: true, trained_for_tool_use: true } // Assume full capabilities for OpenRouter gateway
        };

        const updatedProviders = [...(config.providers || []), providerToAdd];
        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Successfully saved OpenRouter provider");
        setIsModalOpen(false);
        setNewOpenRouterProvider({ apiKey: '', description: '' });
    };

    const handleLemonadeScan = async () => {
        if (!newLemonadeProvider.endpoint) {
            toast.error("Please enter an endpoint first");
            return;
        }
        const result = await fetchModels(false, {
            endpoint: newLemonadeProvider.endpoint,
            apiKey: ''
        }, true);
        if (Array.isArray(result)) {
            const models = result.map(m => typeof m === 'string' ? { id: m, object: 'model' } as Model : m);
            setScannedModels(models);
        }
    };

    const handleLemonadeSave = async () => {
        if (!config || !newLemonadeProvider.model) {
            toast.error("Please select a Model first");
            return;
        }

        const providerToAdd = {
            description: newLemonadeProvider.description.trim() || `Lemonade - ${newLemonadeProvider.model}`,
            endpoint: newLemonadeProvider.endpoint,
            model: newLemonadeProvider.model,
            capabilities: newLemonadeProvider.capabilities
        };

        const updatedProviders = [...(config.providers || []), providerToAdd];
        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Successfully saved Lemonade provider");
        setIsModalOpen(false);
        setNewLemonadeProvider({ endpoint: 'http://localhost:8000', model: '', description: '', capabilities: {} });
    };

    const handleOllamaScan = async () => {
        if (!newOllamaProvider.endpoint) {
            toast.error("Please enter an endpoint first");
            return;
        }
        const result = await fetchModels(false, {
            endpoint: newOllamaProvider.endpoint,
            apiKey: ''
        }, true);
        if (Array.isArray(result)) {
            const models = result.map(m => typeof m === 'string' ? { id: m, object: 'model' } as Model : m);
            setScannedModels(models);
        }
    };

    const handleOllamaSave = async () => {
        if (!config || !newOllamaProvider.model) {
            toast.error("Please select a Model first");
            return;
        }

        const providerToAdd = {
            description: newOllamaProvider.description.trim() || `Ollama - ${newOllamaProvider.model}`,
            endpoint: newOllamaProvider.endpoint,
            model: newOllamaProvider.model,
            capabilities: newOllamaProvider.capabilities
        };

        const updatedProviders = [...(config.providers || []), providerToAdd];
        const newConfig = { ...config, providers: updatedProviders };
        setConfig(newConfig);
        await saveConfig(undefined, newConfig);
        toast.success("Successfully saved Ollama provider");
        setIsModalOpen(false);
        setNewOllamaProvider({ endpoint: 'http://localhost:11434', model: '', description: '', capabilities: {} });
    };

    const augmentedProviders = config?.providers.map((p, i) => ({ ...p, originalIndex: i })) || [];
    const anthropicModels = augmentedProviders.filter(p => p.endpoint.includes('anthropic.com'));
    const googleModels = augmentedProviders.filter(p => p.endpoint.includes('googleapis.com'));
    const lemonadeModels = augmentedProviders.filter(p => p.endpoint.includes(':8000') || p.description.toLowerCase().includes('lemonade'));
    const ollamaModels = augmentedProviders.filter(p => p.endpoint.includes(':11434') || p.description.toLowerCase().includes('ollama'));
    const lmStudioModels = augmentedProviders.filter(p => p.endpoint.includes(':1234'));
    const openAIModels = augmentedProviders.filter(p => p.endpoint.includes('api.openai.com'));
    const openRouterModels = augmentedProviders.filter(p => p.endpoint.includes('openrouter.ai'));
    const otherModels = augmentedProviders.filter(p =>
        !p.endpoint.includes('anthropic.com') &&
        !p.endpoint.includes('googleapis.com') &&
        !p.endpoint.includes(':8000') &&
        !p.description.toLowerCase().includes('lemonade') &&
        !p.endpoint.includes(':11434') &&
        !p.description.toLowerCase().includes('ollama') &&
        !p.endpoint.includes(':1234') &&
        !p.endpoint.includes('api.openai.com') &&
        !p.endpoint.includes('openrouter.ai')
    );

    return (
        <Page
            title="Models"
            subtitle="Configure your AI models."
            headerAction={
                <Button themed={true} icon={faPlus} onClick={() => setIsModalOpen(true)}>Add Model</Button>
            }
        >
            <>
                {augmentedProviders.length === 0 ? (
                    <ModelsTable providers={[]} onRowClick={() => { }} agents={agents} />
                ) : (
                    <>
                        {anthropicModels.length > 0 && (
                            <>
                                <SectionHeader title="Anthropic" icon={AnthropicIcon} />
                                <Card>
                                    <ModelsTable
                                        providers={anthropicModels}
                                        onRowClick={(i) => handleRowClick(anthropicModels[i].originalIndex)}
                                        onDelete={(i) => handleDeleteProvider(anthropicModels[i].originalIndex)}
                                        agents={agents}
                                    />
                                </Card>
                            </>
                        )}

                        {googleModels.length > 0 && (
                            <>
                                <SectionHeader title="Google" icon={GoogleIcon} />
                                <Card>
                                    <ModelsTable
                                        providers={googleModels}
                                        onRowClick={(i) => handleRowClick(googleModels[i].originalIndex)}
                                        onDelete={(i) => handleDeleteProvider(googleModels[i].originalIndex)}
                                        agents={agents}
                                    />
                                </Card>
                            </>
                        )}

                        {lemonadeModels.length > 0 && (
                            <>
                                <SectionHeader title="Lemonade" icon={LemonadeIcon} />
                                <Card>
                                    <ModelsTable
                                        providers={lemonadeModels}
                                        onRowClick={(i) => handleRowClick(lemonadeModels[i].originalIndex)}
                                        onDelete={(i) => handleDeleteProvider(lemonadeModels[i].originalIndex)}
                                        agents={agents}
                                    />
                                </Card>
                            </>
                        )}

                        {ollamaModels.length > 0 && (
                            <>
                                <SectionHeader title="Ollama" icon={OllamaIcon} />
                                <Card>
                                    <ModelsTable
                                        providers={ollamaModels}
                                        onRowClick={(i) => handleRowClick(ollamaModels[i].originalIndex)}
                                        onDelete={(i) => handleDeleteProvider(ollamaModels[i].originalIndex)}
                                        agents={agents}
                                    />
                                </Card>
                            </>
                        )}

                        {lmStudioModels.length > 0 && (
                            <>
                                <SectionHeader title="LM Studio" icon={LMStudioIcon} />
                                <Card>
                                    <ModelsTable
                                        providers={lmStudioModels}
                                        onRowClick={(i) => handleRowClick(lmStudioModels[i].originalIndex)}
                                        onDelete={(i) => handleDeleteProvider(lmStudioModels[i].originalIndex)}
                                        agents={agents}
                                    />
                                </Card>
                            </>
                        )}

                        {openAIModels.length > 0 && (
                            <>
                                <SectionHeader title="OpenAI" icon={OpenAIIcon} />
                                <Card>
                                    <ModelsTable
                                        providers={openAIModels}
                                        onRowClick={(i) => handleRowClick(openAIModels[i].originalIndex)}
                                        onDelete={(i) => handleDeleteProvider(openAIModels[i].originalIndex)}
                                        agents={agents}
                                    />
                                </Card>
                            </>
                        )}

                        {openRouterModels.length > 0 && (
                            <>
                                <SectionHeader title="OpenRouter" icon={OpenRouterIcon} />
                                <Card>
                                    <Row>
                                        <Column grow={true}>
                                            <Text bold={true}>OpenRouter is active</Text>
                                            <Text size="sm" secondary={true}>You can now use OpenRouter models with your agents.</Text>
                                        </Column>
                                        <Column>
                                            <Button size="sm" themed={false} className="!text-rose-500 hover:!bg-rose-500/10" onClick={() => handleDeleteProvider(openRouterModels[0].originalIndex)}>Remove</Button>
                                        </Column>
                                    </Row>
                                    {/* <div className="flex items-center gap-4">
                                        <img src={OpenRouterIcon} className="h-7 dark:invert" alt="OpenRouter" />
                                        <div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                    </div> */}
                                </Card>
                            </>
                        )}

                        {/* {otherModels.length > 0 && (
                            <>
                                <h3 className="text-lg font-semibold px-1">Other</h3>
                                <ModelsTable
                                    providers={otherModels}
                                    onRowClick={(i) => handleRowClick(otherModels[i].originalIndex)}
                                    onDelete={(i) => handleDeleteProvider(otherModels[i].originalIndex)}
                                    agents={agents}
                                />
                            </>
                        )} */}
                    </>
                )}
            </>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Model"
            >
                <Page>
                    {/* <SectionHeader title="Model Name" icon={faTag} /> */}
                    <Column>
                        <Text>Model Name</Text>
                        <Text bold={true}><Code>{editForm.model}</Code></Text>
                    </Column>
                    <Input
                        label="Description"
                        icon={faTag}
                        currentText={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter a description for this model"
                    />
                    <Button
                        themed={true}
                        onClick={handleUpdateProvider}
                        icon={faSave}
                    >Update Model</Button>
                </Page>
            </Modal>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Model"
                className="max-w-2xl"
            >
                {/* PROVIDER BUTTONS */}
                <div className="p-6">
                    <div className="flex gap-4 justify-center mb-6 overflow-x-auto">
                        <ProviderButton
                            isSelected={selectedProviderType === 'anthropic'}
                            onClick={() => setSelectedProviderType('anthropic')}
                            icon={AnthropicIcon}
                            alt="Anthropic"
                            className="dark:invert"
                        />
                        <ProviderButton
                            isSelected={selectedProviderType === 'google-gemini'}
                            onClick={() => setSelectedProviderType('google-gemini')}
                            icon={GoogleIcon}
                            alt="Google Gemini"
                        />
                        <ProviderButton
                            isSelected={selectedProviderType === 'lemonade'}
                            onClick={() => setSelectedProviderType('lemonade')}
                            icon={LemonadeIcon}
                            alt="Lemonade"
                        />
                        <ProviderButton
                            isSelected={selectedProviderType === 'lm-studio'}
                            onClick={() => setSelectedProviderType('lm-studio')}
                            icon={LMStudioIcon}
                            alt="LM Studio"
                        />
                        <ProviderButton
                            isSelected={selectedProviderType === 'ollama'}
                            onClick={() => setSelectedProviderType('ollama')}
                            icon={OllamaIcon}
                            alt="Ollama"
                            className="dark:invert"
                        />
                        <ProviderButton
                            isSelected={selectedProviderType === 'openai'}
                            onClick={() => setSelectedProviderType('openai')}
                            icon={OpenAIIcon}
                            alt="OpenAI"
                            className="dark:invert"
                        />
                        <ProviderButton
                            isSelected={selectedProviderType === 'openrouter'}
                            onClick={() => setSelectedProviderType('openrouter')}
                            icon={OpenRouterIcon}
                            alt="OpenRouter"
                            className="dark:invert"
                        />
                    </div>

                    {selectedProviderType === 'anthropic' && (
                        <Provider
                            name="Anthropic"
                            inputLabel="API KEY"
                            inputIcon={faKey}
                            inputPlaceholder="ant-api-..."
                            description={newAnthropicProvider.description}
                            endpoint={newAnthropicProvider.apiKey}
                            model={newAnthropicProvider.model}
                            models={scannedModels}
                            onDescriptionChange={(val) => setNewAnthropicProvider(prev => ({ ...prev, description: val }))}
                            onEndpointChange={(val) => setNewAnthropicProvider(prev => ({ ...prev, apiKey: val }))}
                            onModelChange={(val) => {
                                const selectedModel = scannedModels.find(m => m.id === val);
                                const capabilities = selectedModel ? detectCapabilities(selectedModel) : {};
                                setNewAnthropicProvider(prev => ({ ...prev, model: val, description: val, capabilities }));
                            }}
                            onScan={handleAnthropicScan}
                            onSave={handleAnthropicSave}
                            footer={
                                <div className="text-center">
                                    <Text size="sm" secondary={true}>
                                        Don't have an API key? Get one at <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">console.anthropic.com</a>
                                    </Text>
                                </div>
                            }
                        />
                    )}

                    {selectedProviderType === 'lm-studio' && (
                        <Provider
                            name="LM Studio"
                            description={newProvider.description}
                            endpoint={newProvider.endpoint}
                            model={newProvider.model}
                            models={scannedModels}
                            onDescriptionChange={(val) => setNewProvider(prev => ({ ...prev, description: val }))}
                            onEndpointChange={(val) => setNewProvider(prev => ({ ...prev, endpoint: val }))}
                            onModelChange={(val) => {
                                const selectedModel = scannedModels.find(m => m.id === val);
                                const capabilities = selectedModel ? detectCapabilities(selectedModel) : {};
                                setNewProvider(prev => ({ ...prev, model: val, description: val, capabilities }));
                            }}
                            onScan={async () => {
                                // Scan with the endpoint provided in the inputs
                                const result = await fetchModels(false, { endpoint: newProvider.endpoint, apiKey: '' }, true);
                                if (Array.isArray(result)) {
                                    // result can be string[] or Model[].
                                    // If it's objects, use them. If strings, map to dummy objects.
                                    const models = result.map(m => typeof m === 'string' ? { id: m, object: 'model' } as Model : m);
                                    setScannedModels(models);
                                }
                            }}
                            onSave={async () => {
                                if (!config) return;

                                const providerToAdd = {
                                    description: newProvider.description,
                                    endpoint: newProvider.endpoint,
                                    model: newProvider.model,
                                    capabilities: newProvider.capabilities
                                };

                                const updatedProviders = [...(config.providers || []), providerToAdd];

                                const newConfig = {
                                    ...config,
                                    providers: updatedProviders
                                };

                                setConfig(newConfig);
                                await saveConfig(undefined, newConfig);
                                toast.success("Successfully saved provider");
                                setIsModalOpen(false);
                                setNewProvider({ description: '', endpoint: '', model: '' });
                            }}
                            footer={
                                <div className="text-center">
                                    <Text size="sm" secondary={true}>
                                        Download LM Studio from <a href="https://lmstudio.ai/download" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">lmstudio.ai/download</a>
                                    </Text>
                                </div>
                            }
                        />
                    )}

                    {selectedProviderType === 'google-gemini' && (
                        <Provider
                            name="Google"
                            inputLabel="API KEY"
                            inputIcon={faKey}
                            inputPlaceholder="Enter your Google Gemini API key"
                            description={newGeminiProvider.description}
                            endpoint={newGeminiProvider.apiKey}
                            model={newGeminiProvider.model}
                            models={scannedModels}
                            onDescriptionChange={(val) => setNewGeminiProvider(prev => ({ ...prev, description: val }))}
                            onEndpointChange={(val) => setNewGeminiProvider(prev => ({ ...prev, apiKey: val }))}
                            onModelChange={(val) => {
                                const selectedModel = scannedModels.find(m => m.id === val);
                                const capabilities = selectedModel ? detectCapabilities(selectedModel) : {};
                                setNewGeminiProvider(prev => ({ ...prev, model: val, description: val, capabilities }));
                            }}
                            onScan={handleGeminiScan}
                            onSave={handleGeminiSave}
                            footer={
                                <div className="text-center">
                                    <Text size="sm" secondary={true}>
                                        Don't have an API key? Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">aistudio.google.com</a>
                                    </Text>
                                </div>
                            }
                        />
                    )}

                    {selectedProviderType === 'lemonade' && (
                        <Provider
                            name="Lemonade"
                            description={newLemonadeProvider.description}
                            endpoint={newLemonadeProvider.endpoint}
                            model={newLemonadeProvider.model}
                            models={scannedModels}
                            onDescriptionChange={(val) => setNewLemonadeProvider(prev => ({ ...prev, description: val }))}
                            onEndpointChange={(val) => setNewLemonadeProvider(prev => ({ ...prev, endpoint: val }))}
                            onModelChange={(val) => {
                                const selectedModel = scannedModels.find(m => m.id === val);
                                const capabilities = selectedModel ? detectCapabilities(selectedModel) : {};
                                setNewLemonadeProvider(prev => ({ ...prev, model: val, description: val, capabilities }));
                            }}
                            onScan={handleLemonadeScan}
                            onSave={handleLemonadeSave}
                            inputPlaceholder="http://localhost:8000"
                            footer={
                                <div className="text-center">
                                    <Text size="sm" secondary={true}>
                                        Download Lemonade from <a href="https://lemonade-server.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">lemonade-server.ai</a>
                                    </Text>
                                </div>
                            }
                        />
                    )}
                    {selectedProviderType === 'ollama' && (
                        <Provider
                            name="Ollama"
                            description={newOllamaProvider.description}
                            endpoint={newOllamaProvider.endpoint}
                            model={newOllamaProvider.model}
                            models={scannedModels}
                            onDescriptionChange={(val) => setNewOllamaProvider(prev => ({ ...prev, description: val }))}
                            onEndpointChange={(val) => setNewOllamaProvider(prev => ({ ...prev, endpoint: val }))}
                            onModelChange={(val) => {
                                const selectedModel = scannedModels.find(m => m.id === val);
                                const capabilities = selectedModel ? detectCapabilities(selectedModel) : {};
                                setNewOllamaProvider(prev => ({ ...prev, model: val, description: val, capabilities }));
                            }}
                            onScan={handleOllamaScan}
                            onSave={handleOllamaSave}
                            inputPlaceholder="http://localhost:11434"
                            footer={
                                <div className="text-center">
                                    <Text size="sm" secondary={true}>
                                        Download Ollama from <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">ollama.com</a>
                                    </Text>
                                </div>
                            }
                        />
                    )}
                    {selectedProviderType === 'openai' && (
                        <Provider
                            name="OpenAI"
                            inputLabel="API KEY"
                            inputIcon={faKey}
                            inputPlaceholder="sk-..."
                            description={newOpenAIProvider.description}
                            endpoint={newOpenAIProvider.apiKey}
                            model={newOpenAIProvider.model}
                            models={scannedModels}
                            onDescriptionChange={(val) => setNewOpenAIProvider(prev => ({ ...prev, description: val }))}
                            onEndpointChange={(val) => setNewOpenAIProvider(prev => ({ ...prev, apiKey: val }))}
                            onModelChange={(val) => {
                                const selectedModel = scannedModels.find(m => m.id === val);
                                const capabilities = selectedModel ? detectCapabilities(selectedModel) : {};
                                setNewOpenAIProvider(prev => ({ ...prev, model: val, description: val, capabilities }));
                            }}
                            onScan={handleOpenAIScan}
                            onSave={handleOpenAISave}
                            footer={
                                <div className="text-center">
                                    <Text size="sm" secondary={true}>
                                        Don't have an API key? Get one at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">platform.openai.com</a>
                                    </Text>
                                </div>
                            }
                        />
                    )}
                    {selectedProviderType === 'openrouter' && (
                        <Page padding={0}>
                            <Text bold={true} size="xl">OpenRouter</Text>
                            <div className="space-y-4">
                                <Input
                                    label="API KEY"
                                    icon={faKey}
                                    currentText={newOpenRouterProvider.apiKey}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOpenRouterProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                                    placeholder="sk-or-v1-..."
                                    clearText={() => setNewOpenRouterProvider(prev => ({ ...prev, apiKey: '' }))}
                                    className="w-full"
                                />
                                <Input
                                    label="(optional) Description"
                                    icon={faTag}
                                    currentText={newOpenRouterProvider.description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOpenRouterProvider(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="My OpenRouter account"
                                    clearText={() => setNewOpenRouterProvider(prev => ({ ...prev, description: '' }))}
                                />
                            </div>
                            <Button
                                themed={true}
                                onClick={handleOpenRouterSave}
                                icon={faSave}
                            >
                                Save OpenRouter Configuration
                            </Button>
                            <div className="text-center pt-2 border-t border-divider border-dashed">
                                <Text size="sm" secondary={true}>
                                    Don't have an API key? Get one at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">openrouter.ai/keys</a>
                                </Text>
                            </div>
                        </Page>
                    )}
                </div>
            </Modal >
        </Page >
    )
}

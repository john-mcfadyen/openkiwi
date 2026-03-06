import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockFour, faStar } from '@fortawesome/free-solid-svg-icons';
import Button from '../../Button';
import Text from '../../Text';
import { EyeIcon, BrainIcon, ToolIcon } from '../../CapabilityIcons';
import Row from '../../Row';
import Column from '../../Column';
import AgentAvatar from '../../AgentAvatar';
const AgentButton = ({ agent, isSelected, onClick, provider }) => {
    return (
        <Button
            size="xl"
            padding={4}
            themed={isSelected}
            onClick={onClick}
            className="w-full !justify-start"
        >
            <Row gap="gap-2">
                <AgentAvatar agent={agent} size="sm" className="mt-0.5" />
                <Column className="w-full" align="stretch" gap="gap-0">
                    <Row justify="between" className="w-full">
                        {/* Left Side: Name + Heartbeat */}
                        <div className="flex items-center gap-2">
                            <Text
                                bold={true}
                                className={isSelected ? "text-white dark:!text-neutral-900" : ""}
                            >
                                {agent.name}
                            </Text>
                            {agent.isDefault && (
                                <Text
                                    size="sm"
                                    secondary={!isSelected}
                                    className={isSelected ? "text-yellow-400 dark:text-yellow-400" : "text-yellow-400"}
                                >
                                    <FontAwesomeIcon icon={faStar} />
                                </Text>
                            )}
                            {agent.heartbeat?.enabled && (
                                <Text
                                    size="sm"
                                    secondary={!isSelected}
                                    className={isSelected ? "text-white dark:!text-neutral-900 opacity-70" : ""}
                                >
                                    <FontAwesomeIcon icon={faClockFour} />
                                </Text>
                            )}
                        </div>

                        {/* Right Side: Capabilities */}
                        {provider?.capabilities && (
                            <div className={`flex gap-1 shrink-0 ${isSelected ? "text-white dark:!text-neutral-900 opacity-90" : "opacity-70"}`}>
                                {provider.capabilities.vision && <EyeIcon small={true} noTooltip={true} />}
                                {provider.capabilities.trained_for_tool_use && <ToolIcon small={true} noTooltip={true} />}
                                {provider.capabilities.reasoning && <BrainIcon small={true} noTooltip={true} />}
                            </div>
                        )}
                    </Row>

                    {/* Bottom Row: Provider/Model Name */}
                    <div className="text-left w-full">
                        <Text
                            secondary={!isSelected}
                            className={isSelected ? "text-white dark:!text-neutral-900 opacity-80" : ""}
                            size="sm"
                        >
                            {agent.provider || 'Global Default'}
                        </Text>
                    </div>
                </Column>
            </Row>
        </Button>
    );
};

AgentButton.displayName = 'AgentButton';

export default AgentButton;

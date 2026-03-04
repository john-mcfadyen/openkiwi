import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from './Button';
import Text from './Text';

const AgentFileButton = ({
    title,
    description,
    icon,
    onClick,
    iconColorClass
}) => {
    return (
        <Button
            secondary={true}
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white-trans flex items-center justify-center ${iconColorClass} transition-all`}>
                    <Text size="2xl">
                        <FontAwesomeIcon icon={icon} />
                    </Text>
                </div>
                <div>
                    <div className="text-xs">
                        <Text size="xs" bold={true}>
                            {title}
                        </Text>
                    </div>
                    <div className="text-xs">
                        <Text size="xs" secondary={true}>
                            {description}
                        </Text>
                    </div>
                </div>
            </div>
        </Button>
    );
};

export default AgentFileButton;

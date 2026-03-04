import React from 'react';
import Text from './Text';
import Code from './Code';
import { TR, TD } from './Table';

interface ConnectedComputerProps {
    hostname: string;
    id: string;
    ip: string;
    connectedAt: string | number | Date;
}

const ConnectedComputer: React.FC<ConnectedComputerProps> = ({ hostname, id, ip, connectedAt }) => {
    return (
        <TR>
            <TD className="text-left">
                <Text bold={true}>{hostname}</Text>
                <Text size="xs" secondary={true}>{id || ''}</Text>
            </TD>
            <TD className="text-center">
                <Code className="text-xs">{ip}</Code>
            </TD>
            <TD className="text-right">
                <Text size="sm" secondary={true}>
                    {new Date(connectedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                </Text>
            </TD>
        </TR>
    );
};

ConnectedComputer.displayName = 'ConnectedComputer';

export default ConnectedComputer;

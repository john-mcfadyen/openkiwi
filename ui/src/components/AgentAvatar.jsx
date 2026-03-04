import React from 'react';
import { Bot } from 'lucide-react';
import Text from './Text';

const getInitials = (name) => {
    if (!name) return "AI";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

const AgentAvatar = ({ agent, size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-10 h-10 text-xl',
        lg: 'w-12 h-12 text-2xl',
        xl: 'w-24 h-24 text-4xl'
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`${currentSize} flex-shrink-0 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-primary ${className}`}>
            {agent?.emoji ? (
                <span className="leading-none">{agent.emoji}</span>
            ) : agent?.name ? (
                <span className="leading-none">{getInitials(agent.name)}</span>
            ) : (
                <Bot size={size === 'sm' ? 16 : size === 'xl' ? 48 : 20} className="text-neutral-400" />
            )}
        </div>
    );
};

AgentAvatar.displayName = 'AgentAvatar';

export default AgentAvatar;

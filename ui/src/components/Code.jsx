import React from 'react';

const Code = ({
    children,
    className = '',
}) => {
    return (
        <code className={`
            bg-neutral-200 dark:bg-neutral-700
            text-primary
            px-1.5 py-0.5 rounded-md font-mono text-sm
            border border-neutral-300 dark:border-neutral-700/50
            ${className}`}>
            {children}
        </code>
    );
};

export default Code;

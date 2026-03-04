import React from 'react';
import Text from './Text';

const ErrorMessage = ({ error, className = '' }) => {
    if (!error) return null;
    return (
        <div className={`bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 ${className}`}>
            <Text size="sm" className="!border-none !text-rose-500">
                {error}
            </Text>
        </div>
    );
};

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;

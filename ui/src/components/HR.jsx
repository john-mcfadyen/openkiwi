import React from 'react';

const HR = ({ width = 'full', className = '' }) => {
    // Map width prop to Tailwind width classes
    const widthMap = {
        'full': 'w-full',
        '1/2': 'w-1/2',
        '1/3': 'w-1/3',
        '2/3': 'w-2/3',
        '1/4': 'w-1/4',
        '3/4': 'w-3/4'
    };

    const widthClass = widthMap[width] || 'w-full';

    return (
        <div className={`my-6 flex items-center justify-center ${className}`}>
            <div className={`h-px bg-divider ${widthClass}`}></div>
        </div>
    );
};

HR.displayName = 'HR';

export default HR;

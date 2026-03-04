import React from 'react';

const Card = ({
    children,
    className = '',
    padding = 'p-6',
    margin = 'm-0',
    gridCols,
    gap = '3',
    align = 'start',
    onClick,
    title
}) => {
    const gapClass = `gap-${gap}`;
    const paddingClass = typeof padding === 'number' ? `p-${padding}` : padding;

    const gridMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12'
    };

    const containerClasses = gridCols
        ? `grid ${gridMap[gridCols] || `grid-cols-${gridCols}`} ${gapClass} ${align === 'center' ? 'justify-items-center' : ''}`
        : `flex flex-col ${gapClass} ${align === 'center' ? 'items-center' : ''}`;

    return (
        <div
            onClick={onClick}
            className={`bg-card rounded-3xl ${paddingClass} ${margin} ${containerClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            title={title}
        >
            {children}
        </div>
    );
};

export default Card;

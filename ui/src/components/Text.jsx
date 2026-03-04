import React from 'react';

const Text = ({
    children,
    secondary = false,
    bold = false,
    code = false,
    size = 'md',
    className = '',
    block = false
}) => {
    const sizeMap = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
    };

    const sizeClass = sizeMap[size] || 'text-base';
    const boldClass = bold ? 'font-bold' : 'font-normal';
    const fontMono = code ? 'font-mono' : '';

    // Check if className contains a text color utility
    const hasCustomColor = /\btext-(?:[a-z]+-\d+|[a-z]+)\b/.test(className);
    const colorClass = secondary
        ? "text-secondary"
        : (hasCustomColor ? "" : "text-primary");

    // Merge default border styling with the provided className
    const borderClass = '';

    const layoutClass = block ? 'block w-full' : 'inline-block';
    const Tag = block ? 'div' : 'span';

    return (
        <Tag className={`${layoutClass} ${sizeClass} ${boldClass} ${fontMono} ${colorClass} ${borderClass} ${className} antialiased`.trim()}>
            {children}
        </Tag>
    );
};

Text.displayName = 'Text';

export default Text;

import React from 'react';

const Column = ({
    children,
    grow = false,
    className = '',
    gap = 'gap-4',
    align = 'start',
    width = ''
}) => {
    // Helper to identify "textual" components that should be grouped tightly
    const isTextual = (child) => {
        if (!child || !child.type) return false;
        const name = child.type.displayName || child.type.name || '';
        return name === 'Text' || name === 'SectionHeader' || name === 'Badge';
    };

    const childrenArray = React.Children.toArray(children).filter(Boolean);

    // Manage vertical margins between children "intelligently"
    const processedChildren = childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;

        const prevChild = childrenArray[index - 1];
        const isCurrentTextual = isTextual(child);
        const isPrevTextual = prevChild && isTextual(prevChild);

        let marginTop = '';
        if (index > 0) {
            if (isCurrentTextual && isPrevTextual) {
                marginTop = 'mt-1';
            } else {
                // Map Tailwind gap classes (gap-4 etc) to margin classes (mt-4)
                marginTop = gap.replace('gap', 'mt');
            }
        }

        return React.cloneElement(child, {
            className: `${child.props.className || ''} ${marginTop}`.trim()
        });
    });

    const growClass = grow ? 'flex-1' : '';
    const widthStyle = width ? { width } : {};

    return (
        <div
            className={`flex flex-col items-${align} ${growClass} ${className}`}
            style={widthStyle}
        >
            {processedChildren}
        </div>
    );
};

Column.displayName = 'Column';

export default Column;

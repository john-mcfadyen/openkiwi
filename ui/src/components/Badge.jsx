import Text from './Text';

const Badge = ({
    children,
    className = '',
    variant = 'default',
    size = 'xs',
    bold = true
}) => {
    const baseClasses = 'px-2 py-0.5 rounded-md tracking-wide uppercase inline-flex items-center justify-center';

    const variantClasses = {
        default: 'bg-neutral-200 dark:bg-neutral-600',
        outline: 'border border-current text-neutral-500',
        accent: 'bg-accent-primary/10 text-accent-primary',
        danger: 'bg-red-500/10 text-red-500',
        success: 'bg-emerald-500/10 text-emerald-500'
    };

    return (
        <Text bold={bold} size={size} className={className}>
            <span className={`${baseClasses} ${variantClasses[variant]}`}>
                {children}
            </span>
        </Text>
    );
};

Badge.displayName = 'Badge';

export default Badge;

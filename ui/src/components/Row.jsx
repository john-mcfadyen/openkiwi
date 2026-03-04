const Row = ({
    children,
    className = '',
    gap = 'gap-8',
    align = 'center',
    justify = 'between'
}) => {
    // Determine the justify class
    const justifyClass = justify === 'between' ? 'justify-between' :
        justify === 'start' ? 'justify-start' :
            justify === 'end' ? 'justify-end' :
                justify === 'center' ? 'justify-center' : '';

    return (
        <div className={`flex flex-row items-${align} ${justifyClass} ${gap} ${className} w-full`}>
            {children}
        </div>
    );
};

Row.displayName = 'Row';

export default Row;

import React from 'react';
import Button from './Button';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export const DeleteButton = ({ onClick, className = '' }) => {
    return (
        <Button
            className={`opacity-0 group-hover:opacity-100 !p-1.5 !rounded-lg flex-shrink-0 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 dark:text-neutral-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 ${className}`}
            icon={faTrash}
            onClick={onClick}
        />
    );
};

export default DeleteButton;

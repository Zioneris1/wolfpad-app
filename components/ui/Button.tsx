import React from 'react';
import { motion } from 'framer-motion';
import cn from 'classnames';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
    className,
    children,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    disabled,
    ...props
}) => {
    const base = 'ui-button';
    const variantClass =
        variant === 'primary'
            ? 'ui-button-primary'
            : variant === 'outline'
            ? 'ui-button-outline'
            : '';

    return (
        <motion.button
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(base, variantClass, sizeClasses[size], 'gap-2', disabled && 'opacity-60 cursor-not-allowed', className)}
            disabled={disabled}
            {...props}
        >
            {leftIcon}
            {children}
            {rightIcon}
        </motion.button>
    );
};

export default Button;


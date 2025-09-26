import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'outline' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center font-semibold transition-all focus:outline-none ios-pill';
const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
	sm: 'text-sm px-3 py-1.5',
	md: 'text-sm md:text-base px-4 py-2',
	lg: 'text-base md:text-lg px-5 py-3',
};
const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
	primary: 'bg-[var(--color-secondary-blue)] text-[var(--color-text-on-accent)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.3)]',
	outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-panel)]',
	ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-panel)]',
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', fullWidth, className = '', ...props }) => {
	const width = fullWidth ? 'w-full' : '';
	return (
		<button className={`${base} ${sizes[size]} ${variants[variant]} ${width} ${className}`} {...props} />
	);
};

export default Button;
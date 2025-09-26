import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
	<label className="block">
		{label && <span className="mb-1 block text-sm text-[var(--color-text-secondary)]">{label}</span>}
		<input
			className={`w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-dark)] px-4 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:border-[var(--color-secondary-blue)] focus:ring-1 focus:ring-[var(--color-secondary-blue)] outline-none ${className}`}
			{...props}
		/>
	</label>
);

export default Input;
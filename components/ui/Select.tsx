import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => (
	<label className="block">
		{label && <span className="mb-1 block text-sm text-[var(--color-text-secondary)]">{label}</span>}
		<select
			className={`w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-dark)] px-4 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-secondary-blue)] focus:ring-1 focus:ring-[var(--color-secondary-blue)] outline-none ${className}`}
			{...props}
		>
			{children}
		</select>
	</label>
);

export default Select;
import React from 'react';

interface TabsProps {
	tabs: { id: string; label: string }[];
	activeId: string;
	onChange: (id: string) => void;
	className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeId, onChange, className = '' }) => {
	return (
		<div className={`flex gap-2 ${className}`}>
			{tabs.map(tab => (
				<button
					key={tab.id}
					onClick={() => onChange(tab.id)}
					className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors border ${activeId === tab.id ? 'bg-[var(--color-secondary-blue)] text-[var(--color-text-on-accent)] border-transparent' : 'bg-[var(--color-bg-dark)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};
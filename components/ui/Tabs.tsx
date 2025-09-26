import React from 'react';

interface TabsProps {
	tabs: { id: string; label: string }[];
	activeId: string;
	onChange: (id: string) => void;
	className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeId, onChange, className = '' }) => {
	return (
		<div className={`ios-seg ${className}`}>
			{tabs.map(tab => (
				<button
					key={tab.id}
					onClick={() => onChange(tab.id)}
					className={`${activeId === tab.id ? 'active' : ''}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};
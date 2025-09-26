import React from 'react';

interface FancyStatTileProps {
	label: string;
	value: string;
	sub?: string;
	accent?: 'blue' | 'red' | 'green';
	children?: React.ReactNode;
}

const accentToColor: Record<string, string> = {
	blue: 'var(--color-secondary-blue)',
	red: 'var(--color-primary-red)',
	green: '#22c55e'
};

const FancyStatTile: React.FC<FancyStatTileProps> = ({ label, value, sub, accent = 'blue', children }) => {
	const color = accentToColor[accent];
	return (
		<div className="glass-panel neon-border cut-corners hover-raise" style={{ padding: '1rem', borderRadius: 16 }}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
				<div>
					<div style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>{label}</div>
					<div style={{ fontSize: '1.9rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 5px ${color}` }}>{value}</div>
					{typeof sub === 'string' && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{sub}</div>}
				</div>
				{children && <div style={{ minWidth: 140 }}>{children}</div>}
			</div>
		</div>
	);
};

export default FancyStatTile;
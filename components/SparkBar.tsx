import React from 'react';

interface SparkBarProps {
	values: number[];
	max?: number;
	height?: number;
	barWidth?: number;
	gap?: number;
	color?: string;
}

const SparkBar: React.FC<SparkBarProps> = ({ values, max, height = 36, barWidth = 6, gap = 4, color = 'var(--color-secondary-blue)' }) => {
	const maxVal = Math.max(1, max ?? Math.max(...values, 1));
	return (
		<div style={{ display: 'flex', alignItems: 'flex-end', gap: `${gap}px`, height }}>
			{values.map((v, i) => {
				const h = Math.max(2, Math.round((v / maxVal) * height));
				return <div key={i} style={{ width: `${barWidth}px`, height: `${h}px`, background: color, borderRadius: '3px', boxShadow: '0 0 8px rgba(59,130,246,0.35)' }} />
			})}
		</div>
	);
};

export default SparkBar;


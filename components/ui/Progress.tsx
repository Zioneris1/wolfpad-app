import React from 'react';

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
	const clamped = Math.max(0, Math.min(100, value));
	return (
		<div className={`w-full h-2 rounded-full bg-[var(--color-bg-dark)] ${className}`}>
			<div
				className="h-2 rounded-full bg-[var(--color-secondary-blue)]"
				style={{ width: `${clamped}%` }}
			/>
		</div>
	);
};

export default Progress;
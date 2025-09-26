import React from 'react';

interface AreaSparklineProps {
    points: number[];
    width?: number;
    height?: number;
    color?: string;
}

const AreaSparkline: React.FC<AreaSparklineProps> = ({ points, width = 220, height = 80, color = 'var(--color-secondary-blue)' }) => {
    if (points.length === 0) return null;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const pad = 6;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
    const step = w / Math.max(1, points.length - 1);
    const line = points.map((v, i) => {
        const x = pad + i * step;
        const y = pad + (1 - norm(v)) * h;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    const lastX = pad + (points.length - 1) * step;
    const area = `${line} L ${lastX} ${height - pad} L ${pad} ${height - pad} Z`;
    const gradientId = `area-spark-${width}-${height}`;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="var(--color-primary-red)" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} opacity={0.12} />
            <path d={line} fill="none" stroke={`url(#${gradientId})`} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.5))' }} />
        </svg>
    );
};

export default AreaSparkline;


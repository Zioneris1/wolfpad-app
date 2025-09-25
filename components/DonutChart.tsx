import React from 'react';

interface DonutChartProps {
    completed: number;
    total: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    animated?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ completed, total, size = 100, strokeWidth = 12, color = 'var(--color-secondary-blue-glow)', animated = true }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const textToShow = total === 0 ? "N/A" : `${Math.round(percentage)}%`;

    const gradientId = `donut-grad-${size}-${strokeWidth}`;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display: 'block', margin: '0 auto'}}>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-secondary-blue)"/>
                    <stop offset="50%" stopColor={color}/>
                    <stop offset="100%" stopColor="var(--color-primary-red)"/>
                </linearGradient>
            </defs>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="var(--color-border)"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={animated ? `url(#${gradientId})` : color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 0.6s ease-in-out', filter: `drop-shadow(0 0 6px ${color})` }}
            />
            <text x="50%" y="50%" 
                textAnchor="middle" 
                dy=".3em" 
                fontSize={size * 0.22} 
                fill="var(--color-text-primary)"
                fontFamily="var(--font-body)"
                style={{textShadow: `0 0 5px ${color}`}}
            >
                {textToShow}
            </text>
        </svg>
    );
};

export default DonutChart;
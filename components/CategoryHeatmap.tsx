import React, { useMemo } from 'react';
import type { Transaction } from '../types';

interface CategoryHeatmapProps {
    transactions: Transaction[];
    topN?: number;
}

const CategoryHeatmap: React.FC<CategoryHeatmapProps> = ({ transactions, topN = 6 }) => {
    const { categories, maxVal } = useMemo(() => {
        const sums: Record<string, number> = {};
        transactions.forEach(t => {
            const v = Math.abs(t.amount);
            sums[t.category] = (sums[t.category] || 0) + v;
        });
        const entries = Object.entries(sums).sort((a,b) => b[1]-a[1]).slice(0, topN);
        const max = Math.max(1, ...entries.map(([,v]) => v));
        return { categories: entries, maxVal: max };
    }, [transactions, topN]);

    if (categories.length === 0) return <p style={{ color: 'var(--color-text-secondary)' }}>No data</p>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
            {categories.map(([name, value]) => {
                const intensity = Math.max(0.1, value / maxVal);
                return (
                    <div key={name} className="glass-panel neon-border" style={{ padding: '0.6rem 0.75rem', borderRadius: 10, background: `rgba(var(--color-secondary-blue-rgb), ${0.08 + intensity * 0.12})` }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{name}</div>
                        <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(value).toLocaleString()}</div>
                    </div>
                )
            })}
        </div>
    );
};

export default CategoryHeatmap;


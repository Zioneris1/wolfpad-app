import React from 'react';

interface TabsProps<T extends string> {
    tabs: { id: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
}

export function Tabs<T extends string>({ tabs, value, onChange }: TabsProps<T>) {
    return (
        <div className="mt-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                            ${value === tab.id
                                ? 'border-[var(--color-secondary-blue)] text-[var(--color-secondary-blue)]'
                                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default Tabs;


import React, { useState } from 'react';
import type { Task } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import TimeTrackerHeader from './TimeTrackerHeader';
import Logo from './Logo';


interface HeaderProps {
    onAddTask: () => void;
    tasks: Task[];
    setView?: (view: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTask, tasks, setView }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <header className="main-header">
            <div className="main-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <Logo className="mobile-header-logo" />
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                 <button onClick={() => setOpen((v) => !v)} title="Menu" style={{
                    background: 'var(--color-bg-panel)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                    padding: '0.6rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                 }}>⋮</button>
                 <button onClick={onAddTask} className="mobile-add-task-btn" style={{
                    background: 'var(--color-primary-red)',
                    color: 'var(--color-text-on-accent)',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                 }}>{t('header.addTask')}</button>
                 </div>
            </div>
            {open && (
                <div className="fade-in" style={{ position: 'absolute', right: '1rem', top: '3.5rem', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem', zIndex: 50 }}>
                    <button onClick={() => { setOpen(false); setView && setView('designGuide'); }} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', padding: '0.5rem 0.75rem', width: '100%', textAlign: 'left' }}>Design Guide</button>
                </div>
            )}
            <TimeTrackerHeader tasks={tasks} />
        </header>
    );
};

export default Header;
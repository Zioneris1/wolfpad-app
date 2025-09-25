import React from 'react';
import type { Task } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import TimeTrackerHeader from './TimeTrackerHeader';
import Logo from './Logo';


interface HeaderProps {
    onAddTask: () => void;
    tasks: Task[];
}

const Header: React.FC<HeaderProps> = ({ onAddTask, tasks }) => {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 768);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return (
        <header className="main-header">
            <div className="main-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '1rem' : '1.25rem' }}>
                 <Logo className="mobile-header-logo" />
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
            <TimeTrackerHeader tasks={tasks} />
        </header>
    );
};

export default Header;
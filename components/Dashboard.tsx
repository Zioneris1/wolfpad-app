import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import FancyStatTile from './FancyStatTile';
import AreaSparkline from './AreaSparkline';
import type { Task } from '../types';
import TaskList from './TaskList';
import BulkActionBar from './BulkActionBar';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardProps {
    tasks: Task[];
    onToggleComplete: (id: string) => void;
    onEdit: (task: Task) => void;
    onView: (task: Task) => void;
    onStartTracking: (id: string) => void;
    onStopTracking: (id: string) => void;
    completeMultipleTasks: (ids: string[]) => void;
    deleteMultipleTasks: (ids: string[]) => void;
    initialFilter: 'pending' | 'completed' | 'all';
    onSetInitialFilter: (filter: 'pending' | 'completed' | 'all') => void;
}

type SortBy = 'impact' | 'createdDate';
type ActiveTab = 'today' | 'upcoming' | 'later';

// --- ICONS ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- NEW COMPONENTS ---
const StatCard: React.FC<{ value: number; label: string; icon: ReactNode; colorClass: string; glow: string }> = ({ value, label, icon, colorClass, glow }) => (
    <div className="flex items-center p-4 hover-raise hex neon-border glass-panel" style={{ backgroundColor: 'rgba(42, 47, 56, 0.5)' }}>
        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${colorClass} text-white`} style={{ boxShadow: `0 0 15px ${glow}` }}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-2xl font-bold" style={{ color: `var(--color-text-primary)` }}>{value}</p>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: `var(--color-text-secondary)` }}>{label}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { t } = useTranslation();
    const { tasks, completeMultipleTasks, deleteMultipleTasks, initialFilter, onSetInitialFilter } = props;
    
    const [filter, setFilter] = useState(initialFilter);
    const [sortBy, setSortBy] = useState<SortBy>('impact');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>('today');

    useEffect(() => {
        setFilter(initialFilter);
    }, [initialFilter]);
    
    const handleCompleteSelected = () => {
        completeMultipleTasks(selectedTasks);
        setSelectedTasks([]);
    };

    const handleDeleteSelected = () => {
        deleteMultipleTasks(selectedTasks);
        setSelectedTasks([]);
    };

    const { displayedTasks, stats, dashboardTasks } = useMemo(() => {
        const dashboardTasks = tasks.filter(t => t.promoted_to_dashboard);
        
        let filteredByStatus = dashboardTasks;
        if (filter === 'pending') {
            filteredByStatus = dashboardTasks.filter(t => !t.completed);
        } else if (filter === 'completed') {
            filteredByStatus = dashboardTasks.filter(t => t.completed);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const todayTasks: Task[] = [];
        const upcomingTasks: Task[] = [];
        const noDueDateTasks: Task[] = [];
        
        filteredByStatus.forEach(task => {
            if (!task.due_date) {
                noDueDateTasks.push(task);
            } else {
                const dueDate = new Date(task.due_date);
                dueDate.setHours(0,0,0,0);
                if (dueDate.toISOString().split('T')[0] <= todayStr) {
                    todayTasks.push(task);
                } else {
                    upcomingTasks.push(task);
                }
            }
        });

        const sortTasks = (arr: Task[]) => arr.sort((a, b) => {
            if (sortBy === 'impact') return b.impact - a.impact;
            // Fix: Changed createdAt to created_at to match Task type.
            if (sortBy === 'createdDate') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return 0;
        });
        
        const tasksByTab = {
            today: sortTasks(todayTasks),
            upcoming: sortTasks(upcomingTasks),
            later: sortTasks(noDueDateTasks),
        };

        const pendingTasks = dashboardTasks.filter(t => !t.completed);
        const stats = {
            dueToday: pendingTasks.filter(t => t.due_date === todayStr).length,
            overdue: pendingTasks.filter(t => t.due_date && t.due_date < todayStr).length,
            completedToday: dashboardTasks.filter(t => t.completed && t.completed_at?.startsWith(todayStr)).length,
        };

        return {
            displayedTasks: tasksByTab[activeTab],
            stats,
            dashboardTasks
        };
    }, [tasks, filter, sortBy, activeTab]);

    const todayStrForScore = useMemo(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d.toISOString().split('T')[0];
    }, []);

    const focusScore = useMemo(() => {
        const total = dashboardTasks.reduce((acc, t) => acc + (t.impact || 0), 0);
        const done = dashboardTasks.filter(t => t.completed).reduce((acc, t) => acc + (t.impact || 0), 0);
        return total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    }, [dashboardTasks]);

    const weekCompletionSeries = useMemo(() => {
        const series: number[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            series.push(tasks.filter(t => t.completed && t.completed_at?.startsWith(key)).length);
        }
        return series;
    }, [tasks]);

    const tabs: { id: ActiveTab; label: string }[] = [
        { id: 'today', label: t('dashboard.dueToday') },
        { id: 'upcoming', label: t('dashboard.upcoming') },
        { id: 'later', label: t('dashboard.noDueDate') },
    ];
    
    return (
        <div className="py-2 md:py-6">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {/* --- Left Column (Main Content) --- */}
                <div className="lg:col-span-2">
                    <header className="glass-panel neon-border cut-corners hover-raise" style={{ padding: '1rem 1.25rem', background: 'rgba(26,29,36,0.55)' }}>
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                            <h1 className="text-3xl font-extrabold tracking-tight glow-title" style={{ margin: 0 }}>
                                Command Center
                            </h1>
                            <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Your day, optimized. Execute with clarity and speed.
                            </p>
                        </motion.div>
                    </header>

                    <div className="mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                            <FancyStatTile label={t('dashboard.dueToday')} value={String(stats.dueToday)} accent="blue" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                            <FancyStatTile label={t('dashboard.overdue')} value={String(stats.overdue)} accent="red" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <FancyStatTile label={t('dashboard.completedToday')} value={String(stats.completedToday)} accent="green">
                                <AreaSparkline points={weekCompletionSeries} width={220} height={70} />
                            </FancyStatTile>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                            <FancyStatTile label="Focus Score" value={`${focusScore}%`} accent="blue" sub={`Today ${todayStrForScore}`} />
                        </motion.div>
                    </div>

                    <div className="mt-6 border-b glass-panel neon-border cut-corners" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(26,29,36,0.55)' }}>
                        <nav className="-mb-px flex space-x-6 scanline" aria-label="Tabs" style={{ paddingLeft: '0.75rem', position: 'relative' }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors duration-200
                                        ${activeTab === tab.id
                                            ? 'border-[var(--color-secondary-blue)] text-[var(--color-secondary-blue)]'
                                            : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'
                                        }`}
                                    style={activeTab === tab.id ? { textShadow: '0 0 8px var(--color-secondary-blue-glow)' } : undefined}
                                >
                                    {tab.label}
                                </button>
                            ))}
                            <div className="underline-glow" style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: `${(activeTab === 'today' ? 33 : activeTab === 'upcoming' ? 66 : 100)}%`, background: 'var(--color-secondary-blue)', transition: 'width 250ms ease' }}></div>
                        </nav>
                    </div>

                    <div className="mt-6">
                        <div className="neo-table-header" style={{ backgroundColor: 'rgba(26,29,36,0.55)' }}>
                            <span>#</span>
                            <span>✓</span>
                            <span>Task / Due</span>
                            <span>Tags</span>
                            <span>Impact</span>
                            <span>Effort</span>
                            <span>Time</span>
                        </div>
                        <TaskList
                            selectedTasks={selectedTasks}
                            onSelectionChange={setSelectedTasks}
                            {...props}
                            tasks={displayedTasks}
                        />
                    </div>
                </div>

                {/* --- Right Column (Sidebar) --- */}
                <div className="mt-8 lg:mt-0 lg:col-span-1">
                    <div className="space-y-6 p-4 md:p-6 rounded-lg glass-panel neon-border cut-corners hover-raise" style={{backgroundColor: 'rgba(26, 29, 36, 0.6)'}}>
                        <div>
                            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h3>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <button onClick={() => onSetInitialFilter('pending')} className="hover-raise" style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)', border: 'none', padding: '0.7rem 0.9rem', borderRadius: 10 }}>Focus 25:00</button>
                                <button onClick={() => onSetInitialFilter('all')} className="hover-raise" style={{ background: 'transparent', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '0.7rem 0.9rem', borderRadius: 10 }}>Add Task</button>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Stats</h3>
                            <div className="mt-4 space-y-4">
                                <StatCard value={stats.dueToday} label={t('dashboard.dueToday')} icon={<CalendarIcon />} colorClass="bg-blue-500" glow="rgba(59,130,246,0.45)" />
                                <StatCard value={stats.overdue} label={t('dashboard.overdue')} icon={<AlertTriangleIcon />} colorClass="bg-red-500" glow="rgba(218,54,51,0.4)" />
                                <StatCard value={stats.completedToday} label={t('dashboard.completedToday')} icon={<CheckCircleIcon />} colorClass="bg-gray-500" glow="rgba(255,255,255,0.25)" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Insights</h3>
                            <div className="mt-3">
                                <AreaSparkline points={weekCompletionSeries} width={320} height={90} />
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>Completions (7 days)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedTasks.length > 0 && (
                <BulkActionBar
                    count={selectedTasks.length}
                    onComplete={handleCompleteSelected}
                    onDelete={handleDeleteSelected}
                    onClear={() => setSelectedTasks([])}
                />
            )}
        </div>
    );
};

export default Dashboard;
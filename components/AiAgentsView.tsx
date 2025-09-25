import React, { useState, useMemo } from 'react';
import type { Task, GoalWithProgress } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { getTaskPrioritization, generateContent, getGoalStrategy } from '../lib/ai';

interface AiAgentsViewProps {
    tasks: Task[];
    goals: GoalWithProgress[];
}

const PrioritizerIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"></path></svg>;
const CreatorIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>;
const StrategistIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path><path d="M12 12m-5 0a5 5 0 1010 0 5 5 0 10-10 0"></path></svg>;

const AgentOutput: React.FC<{ result: string; isLoading: boolean; onCopy?: () => void; onSave?: () => void }> = ({ result, isLoading, onCopy, onSave }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-3 p-3 rounded-lg border" style={{ background: 'var(--color-bg-dark)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{t('aiAgentsView.agentResponse')}</span>
                {result && !isLoading && (
                    <div className="flex gap-2">
                        <button onClick={() => { handleCopy(); onCopy && onCopy(); }} className="text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-secondary-blue)'}}>
                            {copied ? t('aiAgentsView.copied') : t('aiAgentsView.copy')}
                        </button>
                        {onSave && (
                            <button onClick={onSave} className="text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-text-primary)'}}>
                                Save to notes
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)'}}>
                {result || ''}
            </div>
            {isLoading && (
                <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--color-text-secondary)'}}>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span>Thinking...</span>
                </div>
            )}
        </div>
    );
};

const AiAgentsView: React.FC<AiAgentsViewProps> = ({ tasks, goals }) => {
    const { t } = useTranslation();

    // State for Task Prioritizer
    const [isPrioritizerLoading, setIsPrioritizerLoading] = useState(false);
    const [prioritizerResult, setPrioritizerResult] = useState('');

    // State for Content Creator
    const [isCreatorLoading, setIsCreatorLoading] = useState(false);
    const [creatorPrompt, setCreatorPrompt] = useState('');
    const [creatorResult, setCreatorResult] = useState('');

    // State for Goal Strategist
    const [isStrategistLoading, setIsStrategistLoading] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [strategistResult, setStrategistResult] = useState('');
    
    const pendingTasks = useMemo(() => tasks.filter(task => !task.completed), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(task => task.completed), [tasks]);

    const presetPrompts = [
        'Write a concise update for my weekly report about progress and blockers.',
        'Generate 5 tweet ideas about productivity and focus.',
        'Draft a short email to request a project status update.',
        'Summarize my top 3 priorities for today in 2 sentences.',
    ];

    const handleRunPrioritizer = async () => {
        setIsPrioritizerLoading(true);
        setPrioritizerResult('');
        try {
            const result = await getTaskPrioritization(pendingTasks);
            setPrioritizerResult(result);
            showToast('Prioritizer completed');
        } catch (error) {
            setPrioritizerResult(error instanceof Error ? error.message : String(error));
            showToast('Prioritizer failed');
        } finally {
            setIsPrioritizerLoading(false);
        }
    };

    const handleRunCreator = async () => {
        if (!creatorPrompt) return;
        setIsCreatorLoading(true);
        setCreatorResult('');
        try {
            const result = await generateContent(creatorPrompt);
            setCreatorResult(result);
            showToast('Content generated');
        } catch (error) {
            setCreatorResult(error instanceof Error ? error.message : String(error));
            showToast('Content generation failed');
        } finally {
            setIsCreatorLoading(false);
        }
    };

    const handleCreatorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleRunCreator();
        }
    };

    const handleRunStrategist = async () => {
        const selectedGoal = goals.find(g => g.id === selectedGoalId);
        if (!selectedGoal) return;
        setIsStrategistLoading(true);
        setStrategistResult('');
        try {
            const result = await getGoalStrategy(selectedGoal);
            setStrategistResult(result);
            showToast('Strategy generated');
        } catch (error) {
            setStrategistResult(error instanceof Error ? error.message : String(error));
            showToast('Strategy generation failed');
        } finally {
            setIsStrategistLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'var(--color-bg-dark)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        padding: '0.75rem',
        color: 'var(--color-text-primary)'
    };

    // Toast system
    const [toasts, setToasts] = useState<string[]>([]);
    const showToast = (message: string) => {
        setToasts(prev => [...prev, message]);
        setTimeout(() => setToasts(prev => prev.slice(1)), 2500);
    };

    return (
        <div className="fade-in" style={{ padding: '1.5rem 0' }}>
            <header className="mb-4">
                <h2 className="text-3xl font-bold tracking-tight m-0 heading-glow">{t('aiAgentsView.title')}</h2>
                <p className="mt-1 text-sm text-secondary">High‑leverage assistants to boost focus and execution.</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="panel panel-padded" aria-label="Pending tasks">
                    <div className="text-xs uppercase text-secondary">Pending</div>
                    <div className="text-xl font-bold text-primary">{pendingTasks.length}</div>
                </div>
                <div className="panel panel-padded" aria-label="Completed tasks">
                    <div className="text-xs uppercase text-secondary">Completed</div>
                    <div className="text-xl font-bold text-primary">{completedTasks.length}</div>
                </div>
                <div className="panel panel-padded" aria-label="Total tasks">
                    <div className="text-xs uppercase text-secondary">Total Tasks</div>
                    <div className="text-xl font-bold text-primary">{tasks.length}</div>
                </div>
                <div className="panel panel-padded" aria-label="Goals">
                    <div className="text-xs uppercase text-secondary">Goals</div>
                    <div className="text-xl font-bold text-primary">{goals.length}</div>
                </div>
            </div>

            <div className="agents-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Prioritizer Agent */}
                <div className="gradient-card p-[1px] rounded-2xl">
                <div className="agent-card prioritizer p-6 rounded-[15px] shadow-lg" style={{ background: 'var(--color-bg-panel)' }}>
                    <div className="agent-card-header">
                        <div className="agent-card-icon" style={{color: 'var(--color-secondary-blue)'}}>
                            <PrioritizerIcon />
                        </div>
                        <h3 style={{ margin: 0 }}>{t('aiAgentsView.taskPrioritizer')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flex: 1 }}>{t('aiAgentsView.taskPrioritizerDesc')}</p>
                    <div className="flex gap-2">
                    <button aria-label="Run Task Prioritizer" onClick={handleRunPrioritizer} disabled={isPrioritizerLoading || pendingTasks.length === 0} className="btn btn-primary w-full">
                        {isPrioritizerLoading ? t('aiAgentsView.runningAgent') : t('aiAgentsView.runAgent')}
                    </button>
                    <button aria-label="Clear Prioritizer Output" onClick={() => setPrioritizerResult('')} className="btn btn-ghost">Clear</button>
                    </div>
                    {pendingTasks.length === 0 && <p style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>{t('aiAgentsView.noPendingTasks')}</p>}
                    <AgentOutput result={prioritizerResult} isLoading={isPrioritizerLoading} onCopy={() => showToast('Copied prioritizer output')} onSave={() => showToast('Saved to notes (coming soon)')} />
                </div>
                </div>

                {/* Content Creator Agent */}
                <div className="gradient-card p-[1px] rounded-2xl">
                <div className="agent-card creator p-6 rounded-[15px] shadow-lg" style={{ background: 'var(--color-bg-panel)'}}>
                    <div className="agent-card-header">
                        <div className="agent-card-icon" style={{color: '#ff00ff'}}>
                           <CreatorIcon />
                        </div>
                        <h3 style={{ margin: 0 }}>{t('aiAgentsView.contentCreator')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t('aiAgentsView.contentCreatorDesc')}</p>

                    {/* Preset chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {presetPrompts.map((p, idx) => (
                            <button key={idx} type="button" className="chip" onClick={() => setCreatorPrompt(p)} aria-label={`Use preset ${idx + 1}`}>
                                {p.length > 40 ? p.slice(0, 40) + '…' : p}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={creatorPrompt}
                        onChange={e => setCreatorPrompt(e.target.value)}
                        placeholder={t('aiAgentsView.promptPlaceholder')}
                        onKeyDown={handleCreatorKeyDown}
                        style={{ ...inputStyle, minHeight: '110px', marginBottom: '0.5rem' }}
                        aria-label="Content Creator Prompt"
                    />
                    <div className="flex items-center gap-2">
                        <button aria-label="Run Content Creator (Ctrl+Enter)" onClick={handleRunCreator} disabled={isCreatorLoading || !creatorPrompt} className="btn btn-primary w-full">
                            {isCreatorLoading ? t('aiAgentsView.runningAgent') : t('aiAgentsView.runAgent')}
                        </button>
                        <span className="hidden md:inline text-xs px-2 py-1 rounded border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)'}}>Ctrl/⌘ + Enter</span>
                        <button aria-label="Clear Content Creator" onClick={() => { setCreatorPrompt(''); setCreatorResult(''); }} className="btn btn-ghost">Clear</button>
                    </div>
                    <AgentOutput result={creatorResult} isLoading={isCreatorLoading} onCopy={() => showToast('Copied content')} onSave={() => showToast('Saved to notes (coming soon)')} />
                </div>
                </div>

                {/* Goal Strategist Agent */}
                <div className="gradient-card p-[1px] rounded-2xl">
                <div className="agent-card strategist p-6 rounded-[15px] shadow-lg" style={{ background: 'var(--color-bg-panel)'}}>
                     <div className="agent-card-header">
                        <div className="agent-card-icon" style={{color: '#64ffda'}}>
                           <StrategistIcon />
                        </div>
                        <h3 style={{ margin: 0 }}>{t('aiAgentsView.goalStrategist')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t('aiAgentsView.goalStrategistDesc')}</p>
                     <select
                        value={selectedGoalId}
                        onChange={e => setSelectedGoalId(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '1rem' }}
                        disabled={goals.length === 0}
                        aria-label="Select a goal"
                    >
                        <option value="">{t('aiAgentsView.selectGoal')}</option>
                        {goals.map(goal => (
                            <option key={goal.id} value={goal.id}>{goal.name}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button aria-label="Run Goal Strategist" onClick={handleRunStrategist} disabled={isStrategistLoading || !selectedGoalId} className="btn btn-primary w-full">
                            {isStrategistLoading ? t('aiAgentsView.runningAgent') : t('aiAgentsView.runAgent')}
                        </button>
                        <button aria-label="Clear Strategist Output" onClick={() => setStrategistResult('')} className="btn btn-ghost">Clear</button>
                    </div>
                     {goals.length === 0 && <p style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>{t('aiAgentsView.noGoals')}</p>}
                    <AgentOutput result={strategistResult} isLoading={isStrategistLoading} onCopy={() => showToast('Copied strategy')} onSave={() => showToast('Saved to notes (coming soon)')} />
                </div>
                </div>
            </div>
            {/* Toasts */}
            <div className="toast-container">
                {toasts.map((msg, idx) => (
                    <div key={idx} className="toast fade-in">{msg}</div>
                ))}
            </div>
        </div>
    );
};

export default AiAgentsView;
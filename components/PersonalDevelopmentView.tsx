import React, { useState, useEffect } from 'react';
import type { DevelopmentPlan, DevelopmentResource } from '../types';
import { getDevelopmentPlan, getAlternativeResource } from '../lib/ai';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthContext } from '../context/AuthContext';
import { devPlanApi } from '../services/api';
import { subscribe } from '../services/realtime';


const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" /></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const PodcastIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" /></svg>;
const SwapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const PersonalDevelopmentView: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [draftGoal, setDraftGoal] = useState<string>('');
    const [draftBooks, setDraftBooks] = useState<DevelopmentResource[]>([]);
    const [draftYouTube, setDraftYouTube] = useState<DevelopmentResource[]>([]);
    const [draftPodcasts, setDraftPodcasts] = useState<DevelopmentResource[]>([]);
    
    useEffect(() => {
        if (user) {
            setIsDataLoading(true);
            devPlanApi.getPlans(user.id)
                .then(setPlans)
                .catch(err => console.error("Failed to fetch dev plans", err))
                .finally(() => setIsDataLoading(false));
                
            const unsubscribe = subscribe('development_plans', (message: any) => {
                switch (message.type) {
                    case 'DEVELOPMENT_PLAN_CREATED':
                        setPlans((prev: DevelopmentPlan[]) => [message.payload as DevelopmentPlan, ...prev]);
                        break;
                    case 'DEVELOPMENT_PLAN_UPDATED':
                        setPlans((prev: DevelopmentPlan[]) => prev.map((p: DevelopmentPlan) => p.id === (message.payload as DevelopmentPlan).id ? (message.payload as DevelopmentPlan) : p));
                        break;
                    case 'DEVELOPMENT_PLAN_DELETED':
                        setPlans((prev: DevelopmentPlan[]) => prev.filter((p: DevelopmentPlan) => p.id !== (message.payload as { id: string }).id));
                        break;
                }
            });

            return () => unsubscribe();
        } else {
            setPlans([]);
            setIsDataLoading(false);
        }
    }, [user]);

    const handleGeneratePlan = async () => {
        if (!goal || !user) return;
        setIsLoading(true);
        try {
            const newPlanData = await getDevelopmentPlan(goal, 3, 3, 3);
            // Fix: Map the AI response (camelCase) to the database schema (snake_case)
            // to resolve type errors for `youtube_channels` and `author_or_channel`.
            const mapResource = (res: { title: string; authorOrChannel: string; }): DevelopmentResource => ({
                title: res.title,
                author_or_channel: res.authorOrChannel,
            });

            const planPayload = { 
                goal, 
                books: newPlanData.books.map(mapResource),
                youtube_channels: newPlanData.youtubeChannels.map(mapResource),
                podcasts: newPlanData.podcasts.map(mapResource)
            };
            await devPlanApi.createPlan(planPayload, user.id);
            setGoal('');
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to generate plan.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeletePlan = async (planId: string) => {
        if (!user) return;
        const ok = window.confirm(t('personalDevView.confirmDelete'));
        if (!ok) return;
        await devPlanApi.deletePlan(planId, user.id);
    };
    
    const handleArchivePlan = async (planId: string) => {
        if (!user) return;
        const ok = window.confirm(t('personalDevView.confirmArchive'));
        if (!ok) return;
        if ((devPlanApi as any).archivePlan) {
            await (devPlanApi as any).archivePlan(planId, user.id);
        } else {
            // Fallback to delete if archive is not available
            await devPlanApi.deletePlan(planId, user.id);
        }
    };
    
    type ResourceKey = 'books' | 'youtube_channels' | 'podcasts';

    const handleDeleteResource = async (planId: string, resourceTitle: string, type: ResourceKey) => {
        if (!user) return;
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        const updatedResources = (plan[type] as DevelopmentResource[]).filter((r: DevelopmentResource) => r.title !== resourceTitle);
        await devPlanApi.updatePlan(planId, { [type]: updatedResources } as Partial<DevelopmentPlan>, user.id);
    };
    
    const handleSwapResource = async (planId: string, resourceToReplace: DevelopmentResource, type: ResourceKey) => {
        if (!user) return;
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        try {
            const newResource = await getAlternativeResource(plan.goal, resourceToReplace.title);
            const updatedResources = (plan[type] as DevelopmentResource[]).map((r: DevelopmentResource) => r.title === resourceToReplace.title ? { ...newResource, author_or_channel: (newResource as any).authorOrChannel } : r);
            await devPlanApi.updatePlan(planId, { [type]: updatedResources } as Partial<DevelopmentPlan>, user.id);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to swap resource.");
        }
    };

    const beginEdit = (plan: DevelopmentPlan) => {
        setEditingPlanId(plan.id);
        setDraftGoal(plan.goal);
        setDraftBooks(plan.books);
        setDraftYouTube(plan.youtube_channels);
        setDraftPodcasts(plan.podcasts);
    };

    const cancelEdit = () => {
        setEditingPlanId(null);
    };

    const saveEdit = async () => {
        if (!user || !editingPlanId) return;
        await devPlanApi.updatePlan(editingPlanId, {
            goal: draftGoal,
            books: draftBooks,
            youtube_channels: draftYouTube,
            podcasts: draftPodcasts,
        }, user.id);
        setEditingPlanId(null);
    };

    const filteredPlans = plans.filter(p => !p.archived);

    return (
        <div className="py-2 md:py-6">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {/* --- Left Column (Planner) --- */}
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-xl shadow-lg sticky top-6" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--color-secondary-blue)' }}>{t('personalDevView.aiPlanner')}</h3>
                        <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-secondary)' }}>{t('personalDevView.plannerDescription')}</p>
                        <textarea
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            placeholder={t('personalDevView.goalPlaceholder')}
                            className="w-full p-2 rounded-md bg-[var(--color-bg-dark)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                            rows={3}
                        />
                        <button
                            onClick={handleGeneratePlan}
                            disabled={isLoading || !goal.trim()}
                            className="w-full mt-3 font-semibold px-4 py-2 rounded-lg transition-colors"
                            style={{ background: 'var(--color-primary-red)', color: 'var(--color-text-on-accent)' }}
                        >
                            {isLoading ? t('personalDevView.generatingPlan') : t('personalDevView.generatePlan')}
                        </button>
                    </div>
                </div>

                {/* --- Right Column (Plans) --- */}
                <div className="mt-8 lg:mt-0 lg:col-span-2">
                    <h2 className="text-2xl font-bold tracking-tight mb-4">{t('personalDevView.activePlans')}</h2>
                    <div className="space-y-6">
                        {isDataLoading ? <p>Loading plans...</p> : filteredPlans.length > 0 ? filteredPlans.map((plan: DevelopmentPlan) => (
                            <div key={plan.id} className="p-6 rounded-xl shadow-lg" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}>
                                <div className="flex justify-between items-start">
                                    {editingPlanId === plan.id ? (
                                        <input
                                            value={draftGoal}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftGoal(e.target.value)}
                                            className="font-bold text-lg mb-4 bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded px-2 py-1"
                                        />
                                    ) : (
                                        <h3 className="font-bold text-lg mb-4">{plan.goal}</h3>
                                    )}
                                    <div className="flex gap-2">
                                        {editingPlanId === plan.id ? (
                                            <>
                                                <button onClick={saveEdit} className="text-sm font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)' }}>{t('common.save')}</button>
                                                <button onClick={cancelEdit} className="text-sm font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-text-secondary)' }}>{t('common.cancel')}</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => beginEdit(plan)} className="text-sm font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-secondary-blue)' }}>{t('common.edit')}</button>
                                                <button onClick={() => handleArchivePlan(plan.id)} className="text-sm font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-text-secondary)' }}>{t('common.archive')}</button>
                                                <button onClick={() => handleDeletePlan(plan.id)} className="text-sm font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-primary-red)' }}>{t('common.delete')}</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <EditableResourceList
                                        title={`${t('personalDevView.books')} (${(editingPlanId === plan.id ? draftBooks : plan.books).length})`}
                                        icon={<BookIcon />}
                                        resources={editingPlanId === plan.id ? draftBooks : plan.books}
                                        onChange={(resources: DevelopmentResource[]) => setDraftBooks(resources)}
                                        isEditing={editingPlanId === plan.id}
                                        onSwap={(res) => handleSwapResource(plan.id, res, 'books')}
                                        onDelete={(res) => handleDeleteResource(plan.id, res.title, 'books')}
                                    />
                                    <EditableResourceList
                                        title={`${t('personalDevView.youtubeChannels')} (${(editingPlanId === plan.id ? draftYouTube : plan.youtube_channels).length})`}
                                        icon={<YoutubeIcon />}
                                        resources={editingPlanId === plan.id ? draftYouTube : plan.youtube_channels}
                                        onChange={(resources: DevelopmentResource[]) => setDraftYouTube(resources)}
                                        isEditing={editingPlanId === plan.id}
                                        onSwap={(res) => handleSwapResource(plan.id, res, 'youtube_channels')}
                                        onDelete={(res) => handleDeleteResource(plan.id, res.title, 'youtube_channels')}
                                    />
                                    <EditableResourceList
                                        title={`${t('personalDevView.podcasts')} (${(editingPlanId === plan.id ? draftPodcasts : plan.podcasts).length})`}
                                        icon={<PodcastIcon />}
                                        resources={editingPlanId === plan.id ? draftPodcasts : plan.podcasts}
                                        onChange={(resources: DevelopmentResource[]) => setDraftPodcasts(resources)}
                                        isEditing={editingPlanId === plan.id}
                                        onSwap={(res) => handleSwapResource(plan.id, res, 'podcasts')}
                                        onDelete={(res) => handleDeleteResource(plan.id, res.title, 'podcasts')}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-dark)'}}>
                                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)'}}>{t('personalDevView.noPlans')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalDevelopmentView;

const EditableResourceList: React.FC<{
    title: string;
    icon: React.ReactNode;
    resources: DevelopmentResource[];
    isEditing: boolean;
    onChange: (resources: DevelopmentResource[]) => void;
    onSwap: (res: DevelopmentResource) => void;
    onDelete: (res: DevelopmentResource) => void;
}> = ({ title, icon, resources, isEditing, onChange, onSwap, onDelete }) => {
    const { t } = useTranslation();
    const updateResource = (index: number, field: keyof DevelopmentResource, value: string) => {
        const newResources = resources.map((r, i) => i === index ? { ...r, [field]: value } : r);
        onChange(newResources);
    };
    const addResource = () => onChange([...resources, { title: '', author_or_channel: '' }]);
    const removeResource = (index: number) => onChange(resources.filter((_, i) => i !== index));

    return (
        <div>
            <h4 className="flex items-center font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>{icon}<span className="ml-2">{title}</span></h4>
            <ul className="space-y-2">
                {resources.map((res: DevelopmentResource, idx: number) => (
                    <li key={idx} className="flex justify-between items-center p-3 rounded-md group" style={{ background: 'var(--color-bg-dark)' }}>
                        {isEditing ? (
                            <div className="flex-1 grid grid-cols-2 gap-2 pr-4">
                                <input value={res.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateResource(idx, 'title', e.target.value)} className="text-sm bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded px-2 py-1" placeholder={t('personalDevView.resourceTitle')}/>
                                <input value={res.author_or_channel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateResource(idx, 'author_or_channel', e.target.value)} className="text-sm bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded px-2 py-1" placeholder={t('personalDevView.authorOrChannel')}/>
                            </div>
                        ) : (
                            <div>
                                <p className="font-medium text-sm">{res.title}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{res.author_or_channel}</p>
                            </div>
                        )}
                        <div className="flex gap-2">
                            {isEditing ? (
                                <button onClick={() => removeResource(idx)} className="flex items-center text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-primary-red)' }}>
                                    <DeleteIcon /> {t('personalDevView.deleteItem')}
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => onSwap(res)} className="flex items-center text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-secondary-blue)' }}>
                                        <SwapIcon /> {t('personalDevView.swapWithAi')}
                                    </button>
                                    <button onClick={() => onDelete(res)} className="flex items-center text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-primary-red)' }}>
                                        <DeleteIcon /> {t('personalDevView.deleteItem')}
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {isEditing && (
                <button onClick={addResource} className="mt-2 text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-secondary-blue)' }}>
                    + {t('personalDevView.addResource')}
                </button>
            )}
        </div>
    );
};
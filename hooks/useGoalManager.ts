import { useState, useEffect, useCallback, useRef } from 'react';
import type { Goal, Task, GoalWithProgress } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { goalApi } from '../services/api';
import { subscribe } from '../services/realtime';

export const useGoalManager = (tasks: Task[]) => {
    const { user } = useAuthContext();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            // Fix: Pass user.id to getGoals API call.
            goalApi.getGoals(user.id).then(initialGoals => {
                setGoals(initialGoals);
            }).catch(error => {
                console.error("Failed to fetch goals", error);
            }).finally(() => {
                setLoading(false);
            });

            // Fix: Pass table name 'goals' to subscribe function.
            const unsubscribe = subscribe('goals', (message: any) => {
                switch (message.type) {
                    case 'GOAL_CREATED':
                        setGoals(prev => [message.payload, ...prev]);
                        break;
                    case 'GOAL_UPDATED':
                        setGoals(prev => prev.map(g => g.id === message.payload.id ? message.payload : g));
                        break;
                    case 'GOAL_DELETED':
                        setGoals(prev => prev.filter(g => g.id !== message.payload.id));
                        break;
                }
            });

            return () => unsubscribe();
        } else {
            setGoals([]);
            setLoading(false);
        }
    }, [user]);

    const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'created_at' | 'user_id'>) => {
        if (!user) return;
        const payload = {
            ...goalData,
            // Fix: Changed 'createdAt' to 'created_at' to match the Goal type.
            created_at: new Date().toISOString(),
        };
        // Fix: Pass user.id to createGoal API call.
        const newGoal = await goalApi.createGoal(payload, user.id);
        setGoals(prevGoals => [newGoal, ...prevGoals]);
        return newGoal.id;
    }, [user]);

    const updateGoal = useCallback(async (id: string, updatedData: Partial<Omit<Goal, 'id'>>) => {
        if (!user) return;
        // Fix: Pass user.id to updateGoal API call.
        const updatedGoal = await goalApi.updateGoal(id, updatedData, user.id);
        setGoals(prevGoals =>
            prevGoals.map(goal =>
                goal.id === id ? updatedGoal : goal
            )
        );
    }, [user]);

    const deleteGoal = useCallback(async (id: string) => {
        if (!user) return;
        // Fix: Pass user.id to deleteGoal API call.
        await goalApi.deleteGoal(id, user.id);
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    }, [user]);

    // Create a stable reference for tasks to prevent infinite re-renders
    const tasksRef = useRef(tasks);
    if (tasks !== tasksRef.current) {
        tasksRef.current = tasks;
    }

    // Calculate goals with progress without useMemo to avoid circular dependencies
    const goalsWithProgress: GoalWithProgress[] = goals.map(goal => {
        // Use the ref to avoid dependency on tasks array
        const associatedTasks = tasksRef.current.filter(task => task.goal_id === goal.id);
        const completedTasks = associatedTasks.filter(task => task.completed);
        const taskCount = associatedTasks.length;
        const completedTaskCount = completedTasks.length;
        const progress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
        
        return {
            ...goal,
            taskCount,
            completedTaskCount,
            progress
        };
    });

    return {
        goals: goalsWithProgress,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
    };
};
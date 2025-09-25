import { useState, useEffect, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (email: string, pass: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            console.error('Login error:', error.message);
            throw new Error(error.message || 'Login failed');
        }
        setUser(data.user ?? null);
        return true;
    }, []);

    const signup = useCallback(async (email: string, pass: string) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password: pass,
            options: {
                emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
            }
        });
        if (error) {
            console.error('Signup error:', error.message);
            throw new Error(error.message || 'Signup failed');
        }
        // If email confirmations are enabled, user may be null until confirmed
        setUser(data.user ?? null);
        const loggedIn = Boolean(data.user);
        return { success: true, loggedIn };
    }, []);


    const logout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        }
    }, []);

    return { user, loading, login, signup, logout };
};
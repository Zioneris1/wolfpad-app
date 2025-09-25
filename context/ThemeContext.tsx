import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { ThemeOption } from '../types';
import { useAuthContext } from './AuthContext';
import { profileApi } from '../services/api';

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    themes: ThemeOption[];
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark_blue',
    setTheme: () => {},
    themes: [],
});

const themes: ThemeOption[] = [
    {
        id: 'command_center_blue',
        name: 'Command Center Blue',
        styles: {
            '--color-bg-main': '#0F1115',
            '--color-bg-panel': '#151923',
            '--color-bg-dark': '#1E2430',
            '--color-border': '#2B3444',
            '--color-text-primary': '#E6EDF3',
            '--color-text-secondary': '#9AA6B2',
            '--color-text-on-accent': '#FFFFFF',
            '--color-primary-red': '#DA3633',
            '--color-primary-red-glow': '#F85149',
            '--color-secondary-blue': '#3B82F6',
            '--color-secondary-blue-glow': '#58A6FF',
            '--color-secondary-blue-rgb': '59, 130, 246',
            '--color-priority-high': '#DA3633',
            '--color-priority-medium': '#F59E0B',
            '--color-priority-low': '#3B82F6',
        }
    },
    {
        id: 'midnight_purple',
        name: 'Midnight Purple',
        styles: {
            '--color-bg-main': '#12101b',
            '--color-bg-panel': '#1e1c2a',
            '--color-bg-dark': '#2f2c40',
            '--color-border': '#46425c',
            '--color-text-primary': '#e9e7f5',
            '--color-text-secondary': '#9a96b3',
            '--color-text-on-accent': '#FFFFFF',
            '--color-primary-red': '#e54b64',
            '--color-primary-red-glow': '#ff6b81',
            '--color-secondary-blue': '#8b5cf6',
            '--color-secondary-blue-glow': '#a78bfa',
            '--color-secondary-blue-rgb': '139, 92, 246',
            '--color-priority-high': '#e54b64',
            '--color-priority-medium': '#f59e0b',
            '--color-priority-low': '#8b5cf6',
        }
    },
    {
        id: 'forest_canopy',
        name: 'Forest Canopy',
        styles: {
            '--color-bg-main': '#0c1412',
            '--color-bg-panel': '#1a2421',
            '--color-bg-dark': '#2a3834',
            '--color-border': '#42544f',
            '--color-text-primary': '#e6f0ec',
            '--color-text-secondary': '#8da39b',
            '--color-text-on-accent': '#FFFFFF',
            '--color-primary-red': '#e57373',
            '--color-primary-red-glow': '#ef9a9a',
            '--color-secondary-blue': '#66bb6a',
            '--color-secondary-blue-glow': '#81c784',
            '--color-secondary-blue-rgb': '102, 187, 106',
            '--color-priority-high': '#e57373',
            '--color-priority-medium': '#ffd54f',
            '--color-priority-low': '#66bb6a',
        }
    },
    {
        id: 'arctic_wolf',
        name: 'Arctic Wolf',
        styles: {
            '--color-bg-main': '#0a0d12',
            '--color-bg-panel': '#121826',
            '--color-bg-dark': '#1a2133',
            '--color-border': '#2a3550',
            '--color-text-primary': '#e7eef9',
            '--color-text-secondary': '#a7b4cc',
            '--color-text-on-accent': '#FFFFFF',
            '--color-primary-red': '#ef4444',
            '--color-primary-red-glow': '#f87171',
            '--color-secondary-blue': '#60a5fa',
            '--color-secondary-blue-glow': '#93c5fd',
            '--color-secondary-blue-rgb': '96, 165, 250',
            '--color-priority-high': '#ef4444',
            '--color-priority-medium': '#f59e0b',
            '--color-priority-low': '#60a5fa',
        }
    },
    {
        id: 'crimson_dusk',
        name: 'Crimson Dusk',
        styles: {
            '--color-bg-main': '#180e12',
            '--color-bg-panel': '#231318',
            '--color-bg-dark': '#311821',
            '--color-border': '#4b2432',
            '--color-text-primary': '#f4e9ec',
            '--color-text-secondary': '#c9aab2',
            '--color-text-on-accent': '#FFFFFF',
            '--color-primary-red': '#fb7185',
            '--color-primary-red-glow': '#fda4af',
            '--color-secondary-blue': '#e11d48',
            '--color-secondary-blue-glow': '#fb7185',
            '--color-secondary-blue-rgb': '225, 29, 72',
            '--color-priority-high': '#fb7185',
            '--color-priority-medium': '#f59e0b',
            '--color-priority-low': '#e11d48',
        }
    }
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuthContext();
    const [theme, setThemeState] = useState(themes[0].id);

    useEffect(() => {
        if (user) {
            profileApi.getProfile(user.id).then(profile => {
                if (profile?.theme && themes.some(t => t.id === profile.theme)) {
                    setThemeState(profile.theme);
                }
            }).catch(() => {
                // ignore profile fetch errors for theme
            });
        }
    }, [user]);

    useEffect(() => {
        // Guard for non-DOM environments and ensure documentElement exists
        if (typeof document === 'undefined' || !document.documentElement) return;
        const selectedTheme = themes.find(t => t.id === theme) || themes[0];
        Object.entries(selectedTheme.styles).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }, [theme]);
    
    const setTheme = (newTheme: string) => {
        if (!themes.some(t => t.id === newTheme)) return;
        setThemeState(newTheme);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('wolfpad_theme', newTheme);
        }
        if (user) {
            profileApi.updateProfile(user.id, { theme: newTheme }).catch(() => {});
        }
    };

    const value = useMemo(() => ({ theme, setTheme, themes }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
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
        id: 'dark_blue',
        name: 'Dark Blue (Default)',
        styles: {
            '--color-bg-main': '#10141A',
            '--color-bg-panel': '#1A1D24',
            '--color-bg-dark': '#2A2F38',
            '--color-border': '#39414F',
            '--color-text-primary': '#E6EDF3',
            '--color-text-secondary': '#8D96A5',
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
            '--color-bg-main': '#0B1220',
            '--color-bg-panel': '#121A2A',
            '--color-bg-dark': '#1B2436',
            '--color-border': '#2B3852',
            '--color-text-primary': '#E8EEF9',
            '--color-text-secondary': '#9BA7BF',
            '--color-text-on-accent': '#0B1220',
            '--color-primary-red': '#7DD3FC',
            '--color-primary-red-glow': '#BAE6FD',
            '--color-secondary-blue': '#7DD3FC',
            '--color-secondary-blue-glow': '#BAE6FD',
            '--color-secondary-blue-rgb': '125, 211, 252',
            '--color-priority-high': '#60A5FA',
            '--color-priority-medium': '#93C5FD',
            '--color-priority-low': '#7DD3FC',
        }
    },
    {
        id: 'crimson_dusk',
        name: 'Crimson Dusk',
        styles: {
            '--color-bg-main': '#160E13',
            '--color-bg-panel': '#22141E',
            '--color-bg-dark': '#2E1B28',
            '--color-border': '#4A2C3C',
            '--color-text-primary': '#F2E9EC',
            '--color-text-secondary': '#B89AA6',
            '--color-text-on-accent': '#FFFFFF',
            '--color-primary-red': '#F43F5E',
            '--color-primary-red-glow': '#FB7185',
            '--color-secondary-blue': '#FB7185',
            '--color-secondary-blue-glow': '#FDA4AF',
            '--color-secondary-blue-rgb': '251, 113, 133',
            '--color-priority-high': '#F43F5E',
            '--color-priority-medium': '#FB7185',
            '--color-priority-low': '#FDA4AF',
        }
    }
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuthContext();
    const [theme, setThemeState] = useState(() => {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('wolfpad_theme') : null;
        return stored && themes.some(t => t.id === stored) ? stored : themes[0].id;
    });

    useEffect(() => {
        if (!user) return;
        profileApi.getProfile(user.id).then(profile => {
            if (profile?.theme && themes.some(t => t.id === profile.theme)) {
                setThemeState(profile.theme);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem('wolfpad_theme', profile.theme);
                }
            }
        });
    }, [user]);

    useEffect(() => {
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
            profileApi.updateProfile(user.id, { theme: newTheme });
        }
    };

    const value = useMemo(() => ({ theme, setTheme, themes }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
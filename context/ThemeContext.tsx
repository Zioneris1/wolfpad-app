import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { ThemeOption } from '../types';
import { useAuthContext } from './AuthContext';
import { profileApi } from '../services/api';
import { themes as availableThemes } from './themes';

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

const themes: ThemeOption[] = availableThemes;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuthContext();
    const [theme, setThemeState] = useState(themes[0].id);

    useEffect(() => {
        if (user) {
            profileApi.getProfile(user.id).then(profile => {
                if (profile?.theme && themes.some(t => t.id === profile.theme)) {
                    setThemeState(profile.theme);
                }
            });
        }
    }, [user]);

    useEffect(() => {
        const selectedTheme = themes.find(t => t.id === theme) || themes[0];
        Object.entries(selectedTheme.styles).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }, [theme]);
    
    const setTheme = (newTheme: string) => {
        if (!user) return;
        setThemeState(newTheme);
        profileApi.updateProfile(user.id, { theme: newTheme });
    };

    const value = useMemo(() => ({ theme, setTheme, themes }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
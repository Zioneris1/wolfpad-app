import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    const { t } = useTranslation();

    const raw = t('header.title');
    const text = raw.replace('🐺', '').trim() || 'WolfPad';

    const containerStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        lineHeight: 1,
        userSelect: 'none'
    };

    const iconWrapper: React.CSSProperties = {
        width: '2.25rem',
        height: '2.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: '1px solid transparent',
        backgroundImage: 'linear-gradient(var(--color-bg-panel), var(--color-bg-panel)), linear-gradient(120deg, rgba(59,130,246,0.55), rgba(218,54,51,0.35))',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: '0 0 12px rgba(59,130,246,0.45)'
    };

    const iconStyle: React.CSSProperties = {
        filter: 'drop-shadow(0 0 6px var(--color-secondary-blue-glow))',
        fontSize: '1.2rem'
    };

    const textStyle: React.CSSProperties = {
        fontWeight: 800,
        letterSpacing: '0.02em',
        fontSize: '1.3rem',
        backgroundImage: 'linear-gradient(90deg, var(--color-secondary-blue), var(--color-primary-red))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        textShadow: '0 0 10px var(--color-secondary-blue-glow)'
    } as React.CSSProperties;

    return (
        <div className={`app-logo ${className || ''}`} style={containerStyle} aria-label="WolfPad logo">
            <div style={iconWrapper} aria-hidden="true">
                <span style={iconStyle}>🐺</span>
            </div>
            <svg width="160" height="28" viewBox="0 0 160 28" role="img" aria-label="WolfPad wordmark">
                <defs>
                    <linearGradient id="wp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--color-secondary-blue)"/>
                        <stop offset="60%" stopColor="var(--color-secondary-blue-glow)"/>
                        <stop offset="100%" stopColor="var(--color-primary-red)"/>
                    </linearGradient>
                    <filter id="wp-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <text x="0" y="20" fontSize="18" fontWeight={800} letterSpacing="0.02em" filter="url(#wp-glow)" style={{ fill: 'url(#wp-grad)' }}>{text}</text>
            </svg>
        </div>
    );
};

export default Logo;

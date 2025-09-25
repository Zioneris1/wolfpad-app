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
            <span style={textStyle}>{text}</span>
        </div>
    );
};

export default Logo;

import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import Logo from './Logo';

interface LoginViewProps {
    onSwitchToSignUp: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignUp }) => {
    const { login } = useAuthContext();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'var(--color-bg-dark)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
        borderRadius: '4px',
        fontSize: '1rem'
    };
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg-main)', padding: '1rem' }}>
            <div className="panel panel-padded card-elevated" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Logo className="desktop-sidebar-logo" />
                    <h2 style={{ color: 'var(--color-text-primary)', margin: '0.5rem 0 0.25rem' }}>{t('auth.loginTitle')}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.9rem' }}>{t('auth.loginSubtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        className="input"
                        placeholder={t('auth.email')}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="input"
                        placeholder={t('auth.password')}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    {error && <p style={{ color: 'var(--color-primary-red)', margin: 0, textAlign: 'center' }}>{error}</p>}
                    <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {isLoading ? t('common.loading') : t('auth.loginButton')}
                    </button>
                </form>
                 <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{t('auth.dontHaveAccount')} </span>
                    <button onClick={onSwitchToSignUp} style={{ color: 'var(--color-secondary-blue)', fontWeight: 'bold' }}>
                        {t('auth.signup')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
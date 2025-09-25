import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import Logo from './Logo';

interface SignUpViewProps {
    onSwitchToLogin: () => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onSwitchToLogin }) => {
    const { signup } = useAuthContext();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const { success, loggedIn } = await signup(email, password);
            if (!success) {
                setError('Could not create account. Please try again.');
            } else if (!loggedIn) {
                setSuccessMsg('Account created. Please check your email to verify your account before logging in.');
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
                    <h2 style={{ color: 'var(--color-text-primary)', margin: '0.5rem 0 0.25rem' }}>{t('auth.signupTitle')}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.9rem' }}>{t('auth.signupSubtitle')}</p>
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
                    <input
                        type="password"
                        className="input"
                        placeholder={t('auth.confirmPassword')}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                    {error && <p style={{ color: 'var(--color-primary-red)', margin: 0, textAlign: 'center' }}>{error}</p>}
                    {successMsg && <p style={{ color: 'var(--color-secondary-blue)', margin: 0, textAlign: 'center' }}>{successMsg}</p>}
                    <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {isLoading ? t('common.loading') : t('auth.signupButton')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{t('auth.alreadyHaveAccount')} </span>
                    <button onClick={onSwitchToLogin} className="btn btn-ghost" style={{ fontWeight: 'bold' }}>
                        {t('auth.login')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpView;
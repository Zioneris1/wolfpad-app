import React, { useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useDataManager } from '../hooks/useDataManager';

const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const { exportData, importData } = useDataManager();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importData(file);
        }
        // Reset the input so the same file can be selected again
        event.target.value = '';
    };

    return (
        <div className="py-2 md:py-6">
            <h2 className="text-3xl font-bold tracking-tight mb-6" style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>
                {t('settingsView.title')}
            </h2>

            <div className="max-w-2xl mx-auto space-y-8">
                <div className="p-6 rounded-xl shadow-lg glass-panel neon-border cut-corners hover-raise" style={{ backgroundColor: 'rgba(26,29,36,0.55)' }}>
                    <h3 className="font-bold text-lg mb-2">{t('settingsView.dataManagement')}</h3>

                    <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <h4 className="font-semibold">{t('settingsView.exportTitle')}</h4>
                        <p className="text-sm mt-1 mb-3" style={{ color: 'var(--color-text-secondary)' }}>{t('settingsView.exportDesc')}</p>
                        <button 
                            onClick={exportData}
                            className="font-semibold px-4 py-2 rounded-lg transition-colors"
                            style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)', border: 'none' }}
                        >
                            {t('settingsView.exportButton')}
                        </button>
                    </div>

                    <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <h4 className="font-semibold text-[var(--color-primary-red)]">{t('settingsView.importTitle')}</h4>
                        <p className="text-sm mt-1 mb-3" style={{ color: 'var(--color-text-secondary)' }}>{t('settingsView.importDesc')}</p>
                        <button 
                            onClick={handleImportClick}
                            className="font-semibold px-4 py-2 rounded-lg transition-colors"
                            style={{ background: 'transparent', border: '1px solid var(--color-primary-red)', color: 'var(--color-primary-red)' }}
                        >
                            {t('settingsView.importButton')}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className="p-6 rounded-xl shadow-lg glass-panel neon-border cut-corners hover-raise" style={{ backgroundColor: 'rgba(26,29,36,0.55)' }}>
                    <h3 className="font-bold text-lg mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Email summaries</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-secondary-blue)]"></div>
                                <div className="dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-5"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Task due reminders</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-secondary-blue)]"></div>
                                <div className="dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-5"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;

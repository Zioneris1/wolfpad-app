import React, { useMemo, useState } from 'react';
import type { useMoneyManager } from '../hooks/useMoneyManager';
import type { Transaction } from '../types';
import PieChart from './PieChart';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent } from './ui/Card';
import SparkBar from './SparkBar';
import { Tabs } from './ui/Tabs';
import { motion } from 'framer-motion';
import MiniLineChart from './MiniLineChart';
import CategoryHeatmap from './CategoryHeatmap';

interface MoneyViewProps {
    moneyManager: ReturnType<typeof useMoneyManager>;
}

const currencies = [
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'RUB', name: 'Russian Ruble' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'VND', name: 'Vietnamese Dong' },
    { code: 'ZAR', name: 'South African Rand' }
].sort((a, b) => a.code.localeCompare(b.code));


const MoneyView: React.FC<MoneyViewProps> = ({ moneyManager }) => {
    const { t: translate, language } = useTranslation();
    const { 
        transactions: transactionsForDisplay,
        addTransaction,
        deleteTransaction,
        balance,
        totalIncome,
        totalExpenses,
        categories,
        selectedCurrency,
        setSelectedCurrency
    } = moneyManager;

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories.find(c => c.type === 'expense')?.name || '');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    // View state
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'insights'>('overview');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [monthlyBudget, setMonthlyBudget] = useState<number | ''>('');

    const formatCurrency = (value: number) => {
        try {
            return new Intl.NumberFormat(language, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2 }).format(value);
        } catch (e) {
            return `${selectedCurrency} ${value.toFixed(2)}`; // Fallback
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!description || isNaN(numAmount)) return;

        addTransaction({
            date: new Date().toISOString().split('T')[0],
            description,
            amount: type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount),
            category,
        });

        setDescription('');
        setAmount('');
    };

    const availableCategories = categories.filter(c => c.type === type);
    
    // Set default category when type changes
    React.useEffect(() => {
        if (availableCategories.length > 0) {
           setCategory(availableCategories[0]?.name || '');
        }
    }, [type, categories]);

    const formInputStyle: React.CSSProperties = {
      width: '100%',
      padding: '0.75rem',
      background: 'var(--color-bg-dark)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)',
      borderRadius: '4px'
    }

    // Filtered transactions for the page
    const filteredTransactions = useMemo(() => {
        return transactionsForDisplay.filter((t: Transaction) => {
            if (typeFilter !== 'all') {
                if (typeFilter === 'income' && t.amount <= 0) return false;
                if (typeFilter === 'expense' && t.amount >= 0) return false;
            }
            if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
            if (fromDate && t.date < fromDate) return false;
            if (toDate && t.date > toDate) return false;
            if (search && !`${t.description} ${t.category}`.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [transactionsForDisplay, typeFilter, categoryFilter, fromDate, toDate, search]);

    // Compute trends for spark bars (last 12 months)
    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const { incomeSeries, expenseSeries } = useMemo(() => {
        const now = new Date();
        const keys: string[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(now.getMonth() - i);
            keys.push(monthKey(d));
        }
        const sums: Record<string, { inc: number; exp: number }> = {};
        keys.forEach(k => (sums[k] = { inc: 0, exp: 0 }));
        transactionsForDisplay.forEach(t => {
            const d = new Date(t.date + 'T00:00:00');
            const k = monthKey(d);
            if (!(k in sums)) return;
            if (t.amount >= 0) sums[k].inc += t.amount; else sums[k].exp += Math.abs(t.amount);
        });
        return {
            incomeSeries: keys.map(k => Math.round(sums[k].inc)),
            expenseSeries: keys.map(k => Math.round(sums[k].exp)),
        };
    }, [transactionsForDisplay]);

    // Extra metrics
    const { savingsRatePct, last30ExpensesAbs, avgTxnAbs, topCategory } = useMemo(() => {
        const now = new Date();
        const thirtyAgo = new Date(now);
        thirtyAgo.setDate(now.getDate() - 30);
        let income = 0, expensesAbs = 0, sumAbs = 0, count = 0;
        const catSums: Record<string, number> = {};
        transactionsForDisplay.forEach(t => {
            if (new Date(t.date) >= thirtyAgo) {
                if (t.amount < 0) expensesAbs += Math.abs(t.amount);
                else income += t.amount;
            }
            sumAbs += Math.abs(t.amount); count += 1;
            catSums[t.category] = (catSums[t.category] || 0) + Math.abs(t.amount);
        });
        const top = Object.entries(catSums).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';
        const savings = income > 0 ? Math.max(0, 1 - (expensesAbs / income)) * 100 : 0;
        return { savingsRatePct: Math.round(savings), last30ExpensesAbs: expensesAbs, avgTxnAbs: count ? sumAbs / count : 0, topCategory: top };
    }, [transactionsForDisplay]);

    const formatNumber = (value: number) => {
        try {
            return new Intl.NumberFormat(language, { maximumFractionDigits: 0 }).format(value);
        } catch {
            return String(Math.round(value));
        }
    };

    const exportCsv = () => {
        const header = ['Date','Description','Category','Amount','Currency'];
        const rows = filteredTransactions.map(t => [t.date, t.description.replace(/\n/g,' '), t.category, t.amount.toFixed(2), selectedCurrency]);
        const csv = [header, ...rows].map(r => r.map(x => /[,"\n]/.test(String(x)) ? `"${String(x).replace(/"/g,'""')}"` : String(x)).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${selectedCurrency}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '1.5rem 0', paddingBottom: 'calc(84px + env(safe-area-inset-bottom, 0))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ textShadow: `0 0 5px var(--color-secondary-blue)`, letterSpacing: '0.2px', margin: 0 }}>{translate('moneyView.title')}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} style={{...formInputStyle, width: 'auto'}}>
                        {currencies.map((c: { code: string; name: string }) => (
                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                    </select>
                    <button onClick={exportCsv} className="hover-raise" style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', padding: '0.6rem 0.9rem', borderRadius: 8, cursor: 'pointer' }}>Export CSV</button>
                </div>
            </div>

            <Tabs
                tabs={[{ id: 'overview', label: 'Overview' }, { id: 'transactions', label: 'Transactions' }, { id: 'insights', label: 'Insights' }]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as any)}
                className="mb-4"
            />
            
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="hex neon-border glass-panel hover-raise">
                            <CardContent>
                                <p style={{color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', margin: '0 0 0.5rem 0'}}>Income</p>
                                <p style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary-blue-glow)', margin: 0, fontVariantNumeric: 'tabular-nums'}}>{formatCurrency(totalIncome)}</p>
                                <div style={{ marginTop: '0.75rem' }}>
                                    <SparkBar values={incomeSeries} height={36} barWidth={6} gap={4} color={'var(--color-secondary-blue)'} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <Card className="hex neon-border glass-panel hover-raise">
                            <CardContent>
                                <p style={{color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', margin: '0 0 0.5rem 0'}}>Expenses</p>
                                <p style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-red-glow)', margin: 0, fontVariantNumeric: 'tabular-nums'}}>{formatCurrency(Math.abs(totalExpenses))}</p>
                                <div style={{ marginTop: '0.75rem' }}>
                                    <SparkBar values={expenseSeries} height={36} barWidth={6} gap={4} color={'var(--color-primary-red)'} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <Card className="hex neon-border glass-panel hover-raise">
                            <CardContent>
                                <p style={{color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', margin: '0 0 0.5rem 0'}}>Net</p>
                                <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0, fontVariantNumeric: 'tabular-nums'}}>{formatCurrency(balance)}</p>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Savings rate</span>
                                    <span style={{ fontWeight: 700, color: 'var(--color-secondary-blue)' }}>{savingsRatePct}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                        <Card className="hex neon-border glass-panel hover-raise">
                            <CardContent>
                                <p style={{color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', margin: '0 0 0.5rem 0'}}>Last 30d spend</p>
                                <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0, fontVariantNumeric: 'tabular-nums'}}>{formatCurrency(last30ExpensesAbs)}</p>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Avg txn</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(avgTxnAbs)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }} className="responsive-money-grid">
                <div>
                    <Card>
                        <CardContent>
                            <h3 style={{ marginTop: 0 }}>{translate('moneyView.addTransaction')}</h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{display:'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                                    <button type="button" onClick={() => setType('expense')} style={{flex: 1, background: type === 'expense' ? 'var(--color-primary-red)' : 'var(--color-bg-dark)', color: type === 'expense' ? 'var(--color-text-on-accent)' : 'var(--color-text-primary)', border: 'none', padding: '0.6rem', cursor: 'pointer'}}>{translate('moneyView.expense')}</button>
                                    <button type="button" onClick={() => setType('income')} style={{flex: 1, background: type === 'income' ? 'var(--color-secondary-blue)' : 'var(--color-bg-dark)', color: type === 'income' ? 'var(--color-text-on-accent)' : 'var(--color-text-primary)', border: 'none', padding: '0.6rem', cursor: 'pointer'}}>{translate('moneyView.income')}</button>
                                </div>
                                <input type="text" placeholder={translate('moneyView.description')} value={description} onChange={e => setDescription(e.target.value)} required style={formInputStyle} />
                                <input type="number" step="0.01" placeholder={translate('moneyView.amount')} value={amount} onChange={e => setAmount(e.target.value)} required style={{...formInputStyle, margin: '0.75rem 0'}} />
                                <select value={category} onChange={e => setCategory(e.target.value)} required style={formInputStyle} >
                                    {availableCategories.map((cat: { id: string; name: string }) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </select>
                                <button type="submit" style={{width: '100%', marginTop: '1rem', background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)', border: 'none', padding: '0.75rem'}}>{translate('common.add')}</button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={formInputStyle} />
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={formInputStyle} />
                                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} style={formInputStyle}>
                                    <option value="all">All Types</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={formInputStyle}>
                                    <option value="all">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={formInputStyle} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input type="number" placeholder="Monthly budget (optional)" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value === '' ? '' : Number(e.target.value))} style={{...formInputStyle, maxWidth: 260 }} />
                                {typeof monthlyBudget === 'number' && monthlyBudget > 0 && (
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Budget utilization: <strong style={{ color: 'var(--color-primary-red)' }}>{formatNumber(Math.min(100, Math.round((last30ExpensesAbs / monthlyBudget) * 100)))}%</strong></span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <PieChart transactions={filteredTransactions} currency={selectedCurrency} />
                            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Top category: <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{topCategory}</span></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h4 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Net Worth</h4>
                            <MiniLineChart points={incomeSeries.map((v, i) => v - (expenseSeries[i] || 0))} width={320} height={90} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h4 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Category Heatmap</h4>
                            <CategoryHeatmap transactions={filteredTransactions} />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent>
                        <h3 style={{ marginTop: 0 }}>{translate('moneyView.history')}</h3>
                        <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                            <div className="neo-table-header" style={{ display: 'grid', gridTemplateColumns: '140px 1fr 160px 160px', gap: '1rem', padding: '0.6rem 0.75rem', position: 'sticky', top: 0, background: 'var(--color-bg-panel)', zIndex: 1 }}>
                                <div style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Date</div>
                                <div style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Description</div>
                                <div style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Category</div>
                                <div style={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Amount</div>
                            </div>
                            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                                {filteredTransactions.map((t: Transaction, idx: number) => (
                                    <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 160px 160px', gap: '1rem', padding: '0.6rem 0.75rem', borderTop: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                        <div style={{ fontVariantNumeric: 'tabular-nums' }}>{t.date}</div>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>{t.description}</span>
                                        </div>
                                        <div>{t.category}</div>
                                        <div style={{ textAlign: 'right', color: t.amount < 0 ? 'var(--color-primary-red)' : 'var(--color-secondary-blue)', fontVariantNumeric: 'tabular-nums' }}>
                                            {formatCurrency(t.amount)}
                                            <button onClick={() => deleteTransaction(t.id)} title={translate('common.delete')} style={{ marginLeft: '0.75rem', background: 'transparent', border: '1px solid var(--color-border)', padding: '0.1rem 0.4rem', borderRadius: 6, color: 'var(--color-primary-red)', cursor: 'pointer' }}>
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MoneyView;
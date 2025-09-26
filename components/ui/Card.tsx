import React from 'react';

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
	<div className={`ios-surface ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
	<div className={`px-5 py-4 border-b border-[var(--color-border)] ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
	<h3 className={`text-lg font-bold ${className}`}>{children}</h3>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
	<div className={`px-5 py-4 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
	<div className={`px-5 py-4 border-t border-[var(--color-border)] ${className}`}>{children}</div>
);
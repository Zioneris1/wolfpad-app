import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, header, footer, children, ...props }) => {
    return (
        <div className={`ui-card ${className || ''}`} {...props}>
            {header && (
                <div style={{ padding: '1rem 1rem 0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    {header}
                </div>
            )}
            <div style={{ padding: '1rem' }}>{children}</div>
            {footer && (
                <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid var(--color-border)' }}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;


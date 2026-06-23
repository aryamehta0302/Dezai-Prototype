import React from 'react';

interface InfoRowProps {
    label: string;
    value: string | React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <>
        <div className="flex flex-col mb-4">
            <span className="text-sm font-medium text-muted mb-1">{label}</span>
            <span className="text-md font-semibold text-on-surface">{value}</span>
        </div>
    </>
);
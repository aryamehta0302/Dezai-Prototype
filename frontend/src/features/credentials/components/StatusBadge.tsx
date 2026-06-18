// components/StatusBadge.tsx
import React from 'react';
import { VerifyStatus } from '../types/credential.types';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface StatusBadgeProps {
    status: VerifyStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    // Config map to easily manage colors and icons for different statuses
    const config = {
        ACTIVE: {
            bg: 'bg-green-500/10',
            text: 'text-green-600',
            border: 'border-green-500/20',
            icon: <ShieldCheck className="w-4 h-4 mr-1.5" />,
            label: 'Valid & Active'
        },
        REVOKED: {
            bg: 'bg-red-500/10',
            text: 'text-red-600',
            border: 'border-red-500/20',
            icon: <ShieldAlert className="w-4 h-4 mr-1.5" />,
            label: 'Revoked'
        },
        SUSPENDED: {
            bg: 'bg-yellow-500/10',
            text: 'text-yellow-600',
            border: 'border-yellow-500/20',
            icon: <Clock className="w-4 h-4 mr-1.5" />,
            label: 'Suspended (Under Review)'
        }
    };

    const currentConfig = config[status];

    return (
        <>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border}`}>
                {currentConfig.icon}
                {currentConfig.label}
            </span>
        </>
    );
};
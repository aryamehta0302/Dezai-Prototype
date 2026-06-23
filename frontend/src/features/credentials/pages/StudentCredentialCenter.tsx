"use client";

import { useState, useEffect } from 'react';
import { useCredentialContext } from '../context/CredentialContext';
import { CredentialCard } from '../components/CredentialCard';
import { Loader2, Search } from 'lucide-react';

export function StudentCredentialCenter({ userId }: { userId: string }) {
    const { credentials, isLoading: loading, fetchStudentCredentials } = useCredentialContext();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudentCredentials(userId);
    }, [userId, fetchStudentCredentials]);

    const filteredCredentials = credentials.filter(c =>
        c.program?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.institution?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">My Credentials</h1>
                    <p className="text-muted text-sm mt-1">{credentials.length} credential{credentials.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border-light bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            {filteredCredentials.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border-light rounded-xl">
                    <p className="text-muted">No credentials found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCredentials.map((cred) => (
                        <CredentialCard key={cred.id} credential={cred} />
                    ))}
                </div>
            )}
        </div>
    );
}

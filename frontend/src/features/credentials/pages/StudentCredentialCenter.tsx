"use client";

import React, { useState, useEffect } from 'react';
import { useCredentialContext } from '../context/CredentialContext';
import { CredentialCard } from '../components/CredentialCard';
import { Loader2, Share2, Search, Filter } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function StudentCredentialCenter({ userId }: { userId: string }) {
    const { credentials, isLoading: loading, fetchStudentCredentials } = useCredentialContext();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudentCredentials(userId);
    }, [userId]);

    const activeCredentials = credentials.filter(c => c.verificationStatus === 'ACTIVE');
    const filteredCredentials = credentials.filter(c => 
        c.program?.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.institution?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10 mb-4" />
                </div>
                <p className="text-muted font-medium">Loading your portfolio...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary-container to-secondary p-8 sm:p-12 text-white shadow-level-1">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-float" />
                    <div className="absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-white/15 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-xl">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Your Professional Portfolio</h1>
                        <p className="text-white/80 text-lg leading-relaxed mb-8">
                            Showcase your university-grade micro-credentials. Every credential here represents verified mastery and industry-ready skills.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Total Earned</p>
                                <p className="text-3xl font-bold">{credentials.length}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Active Status</p>
                                <p className="text-3xl font-bold">{activeCredentials.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <Button className="rounded-xl bg-white text-primary hover:bg-neutral-50 shadow-lg px-6 h-12 border-0">
                            <Share2 className="h-5 w-5 mr-2" />
                            Share Full Portfolio
                        </Button>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input 
                        type="text" 
                        placeholder="Search credentials by program or institution..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <Button variant="outline" className="w-full sm:w-auto h-12 rounded-xl bg-surface">
                    <Filter className="h-5 w-5 mr-2" />
                    Filter by Tier
                </Button>
            </div>

            {/* Credentials Grid */}
            {filteredCredentials.length === 0 ? (
                <div className="text-center py-20 px-6 border-2 border-dashed border-border-light rounded-3xl bg-surface">
                    <p className="text-muted text-lg font-medium">No credentials found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCredentials.map((cred) => (
                        <CredentialCard key={cred.id} credential={cred} />
                    ))}
                </div>
            )}
        </div>
    );
}

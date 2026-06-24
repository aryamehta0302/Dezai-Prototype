"use client";

import React, { useEffect } from 'react';
import { useCredentials } from '@/features/credentials/hooks/useCredentials';
import { CredentialCard } from '@/features/credentials/components/atomic/credential-card';
import { Award, Loader2, Search, ShieldAlert, ArrowLeft, User } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function StudentDashboard() {
  const { credentials, fetchMyCredentials, loading, error } = useCredentials();
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    fetchMyCredentials();
  }, [fetchMyCredentials]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* Compact Premium SaaS Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20 shadow-sm relative overflow-hidden">
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
        
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left side: Back button & Title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link 
                href="/dashboard" 
                className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center bg-slate-100/50 hover:bg-slate-100 text-slate-500 hover:text-primary transition-all border border-transparent hover:border-slate-200"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">Your Credentials</h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-600 tracking-widest uppercase">Verified</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">Manage and share your cryptographic certificates</p>
              </div>
            </div>
            
            {/* Right side: Search & Auth Details */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              <div className="relative w-48 sm:w-64 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search certificates..." 
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100/50 border border-slate-200/50 focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-lg text-xs font-medium transition-all text-slate-900 shadow-sm"
                />
              </div>

              {/* Student Auth Profile */}
              {user && (
                <div className="flex items-center gap-3 sm:pl-5 sm:border-l border-slate-200/50">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight tracking-tight">{user.name || 'Student'}</span>
                    <span className="text-[10px] text-slate-500 font-semibold capitalize tracking-wide">{user.role?.replace('_', ' ').toLowerCase() || 'Student'}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white hover:ring-indigo-100 transition-all cursor-pointer">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="w-full flex flex-col items-center justify-center py-32 px-4 text-center border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-amber-100 relative z-10">
               <ShieldAlert className="w-10 h-10 text-amber-500" />
            </div>
            
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight relative z-10">Authentication Required</h3>
            
            <p className="text-slate-500 mb-10 max-w-sm text-sm leading-relaxed relative z-10">
              {error.toLowerCase().includes('authorization') || error.toLowerCase().includes('token')
                ? "You need to sign in to view and manage your verified credentials."
                : error}
            </p>
            
            <div className="relative z-10">
              <Link href="/login">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold h-12 px-8 rounded-xl text-sm shadow-md">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Clean Empty State */}
        {!loading && credentials.length === 0 && !error && (
          <div className="w-full flex flex-col items-center justify-center py-32 px-4 text-center border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
              <Award className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No credentials found</h3>
            <p className="text-slate-500 mb-8 max-w-sm text-sm">
              You haven't earned any credentials yet. Complete a program to get started.
            </p>
            <Button className="bg-primary text-white hover:bg-primary/90 rounded-xl px-8 h-12 text-sm font-bold shadow-sm">
              Browse Programs
            </Button>
          </div>
        )}

        {/* Minimal Grid */}
        {!loading && credentials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {credentials.map((cred: any) => (
              <CredentialCard key={cred.id} credential={cred} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

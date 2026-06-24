"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

export function VerificationSearch() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      // Assuming they might paste a full URL or just a code
      let finalCode = code.trim();
      if (finalCode.includes('/verify/')) {
        finalCode = finalCode.split('/verify/')[1];
      }
      router.push(`/credentials/verify/${finalCode}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
      <div className="relative bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 p-2 flex items-center">
        <div className="pl-4 pr-2 text-slate-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <Input 
          type="text" 
          placeholder="Enter Credential ID or Link..." 
          className="border-0 focus-visible:ring-0 text-lg py-6 shadow-none flex-1"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button type="submit" size="lg" className="rounded-xl bg-slate-900 hover:bg-slate-800 px-8 py-6 ml-2">
          Verify <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  );
}

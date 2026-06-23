"use client";

import React, { useState, useEffect } from 'react';
import { useCredentialContext } from '../context/CredentialContext';
import { CredentialService } from '../services/credential.service';
import { CredentialTier, CredentialType, CredentialTemplate } from '../types/credential.types';
import { Button } from '@/shared/ui/button';
import { X, Loader2, Award, Building2, User, Layers, FileSignature } from 'lucide-react';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export function IssueCredentialModal({ onClose, onSuccess }: Props) {
    const { issueCredential } = useCredentialContext();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<CredentialTemplate[]>([]);
    
    const [formData, setFormData] = useState({
        userId: '',
        programId: '',
        institutionId: 'inst-001',
        issuedById: 'faculty-001',
        credentialType: 'PROGRAM' as CredentialType,
        templateId: '',
        tier: '' as CredentialTier | '' // Empty means use template default
    });

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await CredentialService.getTemplatesByType(formData.credentialType);
                setTemplates(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, templateId: data[0].id }));
                } else {
                    setFormData(prev => ({ ...prev, templateId: '' }));
                }
            } catch (error) {
                console.error("Failed to fetch templates", error);
            }
        };
        fetchTemplates();
    }, [formData.credentialType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.templateId) {
            alert("Please select a template");
            return;
        }
        
        setLoading(true);
        try {
            await issueCredential({
                ...formData,
                tier: formData.tier || undefined
            } as Parameters<typeof issueCredential>[0]);
            onSuccess();
        } catch (error) {
            console.error("Failed to issue credential", error);
            alert("Failed to issue credential");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="relative bg-linear-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mb-4 shadow-inner">
                        <Award className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Grant Credential</h2>
                    <p className="text-emerald-100 text-sm mt-1">Select a template to issue a secure digital certificate.</p>
                </div>
                
                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted absolute -top-2.5 left-3 bg-white px-1 z-10">User ID</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-3 h-4 w-4 text-muted z-10" />
                                <input 
                                    required
                                    type="text" 
                                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-border-light bg-neutral-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all relative z-0"
                                    placeholder="user-456"
                                    value={formData.userId}
                                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="relative">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted absolute -top-2.5 left-3 bg-white px-1 z-10">Program ID</label>
                            <div className="relative flex items-center">
                                <Building2 className="absolute left-3 h-4 w-4 text-muted z-10" />
                                <input 
                                    required
                                    type="text" 
                                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-border-light bg-neutral-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all relative z-0"
                                    placeholder="prog-789"
                                    value={formData.programId}
                                    onChange={(e) => setFormData({...formData, programId: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 mt-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Issuance Template</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 absolute -top-2.5 left-3 bg-slate-50 px-1">Type</label>
                                <div className="relative flex items-center">
                                    <Layers className="absolute left-3 h-4 w-4 text-emerald-600" />
                                    <select 
                                        className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none font-medium text-emerald-900"
                                        value={formData.credentialType}
                                        onChange={(e) => setFormData({...formData, credentialType: e.target.value as CredentialType})}
                                    >
                                        <option value="PROGRAM">Program</option>
                                        <option value="ASSESSMENT">Assessment</option>
                                        <option value="MERIT">Merit Award</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 absolute -top-2.5 left-3 bg-slate-50 px-1">Tier Override</label>
                                <select 
                                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none font-medium text-emerald-900"
                                    value={formData.tier}
                                    onChange={(e) => setFormData({...formData, tier: e.target.value as CredentialTier | ''})}
                                >
                                    <option value="">(Use Template Default)</option>
                                    <option value="FORGE">FORGE (Foundational)</option>
                                    <option value="ARENA">ARENA (Advanced)</option>
                                    <option value="CITADEL">CITADEL (Expert)</option>
                                </select>
                            </div>
                        </div>

                        <div className="relative mt-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 absolute -top-2.5 left-3 bg-slate-50 px-1">Select Template</label>
                            <div className="relative flex items-center">
                                <FileSignature className="absolute left-3 h-4 w-4 text-emerald-600" />
                                <select 
                                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none font-medium text-emerald-900"
                                    value={formData.templateId}
                                    onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                                    required
                                >
                                    {templates.length === 0 && <option value="">No templates found...</option>}
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} (Default: {t.defaultTier})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !formData.templateId} className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 shadow-md text-white border-0">
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Award className="h-4 w-4 mr-2" />}
                            Issue Now
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

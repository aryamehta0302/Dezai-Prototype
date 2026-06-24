"use client";

import { cn } from "@/shared/utils/cn";
import { Award, GraduationCap } from "lucide-react";
import { TIER_CONFIG } from "../types/certificate.types";
import { formatDate } from "@/shared/utils/format";
import type { MockCertificate } from "@/lib/mock-data/certificates";

interface CertificatePreviewProps {
  certificate: MockCertificate;
  className?: string;
}

export function CertificatePreview({ certificate, className }: CertificatePreviewProps) {
  const tier = TIER_CONFIG[certificate.tier];
  const cornerColorClass = tier.color.replace("text-", "border-");

  return (
    <div
      className={cn(
        "relative w-full max-w-4xl mx-auto aspect-[1.414/1] rounded-xl border-8 double bg-[#fdfdfa] p-12 flex flex-col justify-between text-center shadow-2xl select-none",
        tier.borderColor,
        className
      )}
      style={{
        boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15), inset 0 0 0 12px rgba(139, 92, 26, 0.05), inset 0 0 60px rgba(10, 22, 40, 0.02)",
        borderStyle: "double",
        fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif"
      }}
    >
      {/* Classical Border Lines */}
      <div className={cn("absolute top-3 left-3 right-3 bottom-3 border border-dashed opacity-30 pointer-events-none", cornerColorClass)} />

      {/* Decorative corners */}
      <div className={cn("absolute top-5 left-5 h-16 w-16 border-t-2 border-l-2 border-r-0 border-b-0 opacity-60", cornerColorClass)} />
      <div className={cn("absolute bottom-5 right-5 h-16 w-16 border-b-2 border-r-2 border-t-0 border-l-0 opacity-60", cornerColorClass)} />
      <div className={cn("absolute top-5 right-5 h-16 w-16 border-t-2 border-r-2 border-l-0 border-b-0 opacity-60", cornerColorClass)} />
      <div className={cn("absolute bottom-5 left-5 h-16 w-16 border-b-2 border-l-2 border-t-0 border-r-0 opacity-60", cornerColorClass)} />

      {/* Top Section: Header & Title */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-9 w-9 text-amber-700 opacity-85" />
            <span className="text-2xl font-bold tracking-wide text-slate-800">
              {certificate.universityName}
            </span>
          </div>
          <p className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase text-amber-800/80">
            Dezai Academic Registry
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-extrabold tracking-normal text-slate-900 italic font-serif">
            Certificate of Completion
          </p>
          <div className="h-0.5 w-40 bg-linear-to-r from-transparent via-amber-700/50 to-transparent mx-auto mt-2" />
        </div>
      </div>

      {/* Middle Section: Recipient & Completion Details */}
      <div className="space-y-4 my-auto">
        <div className="space-y-1">
          <p className="text-xs italic text-slate-500">This credential certifies that</p>
          <p className="text-3xl font-bold text-slate-800 tracking-wide underline decoration-amber-600/30 underline-offset-8">
            {certificate.userName}
          </p>
        </div>

        <div className="space-y-1.5 max-w-2xl mx-auto">
          <p className="text-xs italic text-slate-600">
            has successfully satisfied all academic requirements and passed the comprehensive assessment for
          </p>
          <p className="text-xl font-bold text-amber-800 tracking-wide leading-tight px-4">
            {certificate.courseTitle}
          </p>
          <p className="text-[11px] text-slate-500 font-sans tracking-wide">
            Issued with the verification tier: <span className="font-semibold">{tier.label}</span>
          </p>
        </div>
      </div>

      {/* Bottom Section: Signatures & Golden Seal */}
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 items-end max-w-3xl mx-auto px-6">
          {/* Registrar */}
          <div className="text-center space-y-1 font-sans">
            <div className="h-8 flex items-center justify-center">
              <span className="font-serif italic text-base text-slate-700/85 select-none font-semibold">Dezai Registry</span>
            </div>
            <div className="border-t border-slate-300 w-3/4 mx-auto" />
            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Office of Registrar</p>
          </div>

          {/* Golden Seal */}
          <div className="flex flex-col items-center justify-center select-none">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-600/30 shadow-inner">
              <div className="absolute inset-0.5 rounded-full border border-dashed border-amber-600/40" />
              <Award className="h-8 w-8 text-amber-700 opacity-90" />
            </div>
            <span className="text-[8px] uppercase font-sans tracking-widest text-amber-800 mt-1.5 font-bold">SECURE VERIFIED</span>
          </div>

          {/* Instructor */}
          <div className="text-center space-y-1 font-sans">
            <div className="h-8 flex items-center justify-center">
              <span className="font-serif italic text-base text-slate-700/85 select-none font-semibold">
                {certificate.instructorName}
              </span>
            </div>
            <div className="border-t border-slate-300 w-3/4 mx-auto" />
            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Authorized Instructor</p>
          </div>
        </div>

        {/* Scores & Metadata Footer */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-b border-slate-200/60 py-2.5 max-w-3xl mx-auto font-sans text-slate-700 text-xs">
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Grade</span>
            <span className="text-sm font-bold text-slate-800">{certificate.grade}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Examination Score</span>
            <span className="text-sm font-bold text-slate-800">{certificate.score}%</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Issue Date</span>
            <span className="text-sm font-bold text-slate-800">{formatDate(certificate.issuedAt)}</span>
          </div>
        </div>

        {/* Ledger Validation ID Footer */}
        <div className="font-sans text-[10px]">
          <p className="text-slate-500 tracking-wide">
            Certificate ID: <span className="font-mono font-semibold text-slate-700">{certificate.id}</span>
          </p>
          <p className="text-slate-400 mt-0.5">
            Verify digital authenticity at: <span className="text-amber-700 font-medium">dezai.ai/verify/{certificate.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

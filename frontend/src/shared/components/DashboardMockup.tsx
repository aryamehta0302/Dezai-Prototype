"use client";

export default function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="size-3 rounded-full bg-[#FF5F56]" />
        <span className="size-3 rounded-full bg-[#FFBD2E]" />
        <span className="size-3 rounded-full bg-[#27C93F]" />
        <div className="mx-auto flex items-center gap-1 rounded-md bg-slate-200/60 px-4 py-1 sm:px-24">
          <span className="text-[11px] font-medium text-slate-400">
            dezai.ai/dashboard
          </span>
        </div>
      </div>
      <div className="flex h-[300px] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 sm:h-[380px]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-slate-100">
            <svg className="size-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
          </div>
          <p className="text-[13px] font-medium text-slate-400">Dashboard preview</p>
          <p className="text-[11px] text-slate-300">Replace with screenshot</p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="max-w-lg text-center space-y-8">
        <h1 className="text-[12rem] sm:text-[16rem] font-bold leading-none tracking-tighter text-primary/10 select-none">
          404
        </h1>
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Page not found
          </h2>
          <p className="text-muted text-sm sm:text-base">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-all active:scale-[0.98]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

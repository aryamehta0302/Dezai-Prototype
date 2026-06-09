import { cn } from "@/shared/utils/cn";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12",
        className
      )}
    >
      {children}
    </div>
  );
}

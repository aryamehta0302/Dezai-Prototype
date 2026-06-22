import { forwardRef, useState } from "react"
import { cn } from "@/shared/utils"

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  icon?: React.ReactNode
}

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ children, icon, className, ...props }, ref) => {
    const [pressed, setPressed] = useState(false)

    return (
      <button
        ref={ref}
        data-slot="premium-button"
        className={cn(
          "group relative inline-flex items-center justify-center gap-4 overflow-hidden rounded-[26px] border border-white/20 px-10 py-5",
          "font-sans text-2xl font-semibold tracking-tight text-white",
          "cursor-pointer select-none outline-none",
          "transition-[transform,box-shadow,filter] duration-300",
          "hover:shadow-[0_16px_45px_rgba(44,102,255,0.28)]",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          pressed && "scale-[0.985] shadow-[0_6px_18px_rgba(44,102,255,0.18)]",
          !pressed && "shadow-[0_10px_30px_rgba(44,102,255,0.22)]",
          className,
        )}
        style={{
          background: "linear-gradient(135deg, #2ea5ff 0%, #2b83ff 35%, #2d6eff 65%, #3157ff 100%)",
          boxShadow: pressed
            ? "0 6px 18px rgba(44,102,255,0.18), inset 0 3px 8px rgba(0,0,0,0.18), inset 0 0 30px rgba(255,255,255,0.08)"
            : "0 10px 30px rgba(44,102,255,0.22), inset 0 2px 0 rgba(255,255,255,0.35), inset 1px 0 0 rgba(255,255,255,0.14), inset -1px 0 0 rgba(255,255,255,0.10), inset 0 -2px 5px rgba(0,0,0,0.14), inset 0 0 35px rgba(255,255,255,0.12)",
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        {...props}
      >
        <div
          className="pointer-events-none absolute inset-[1px] rounded-[inherit]"
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08) 35%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -inset-[2px] rounded-[inherit]"
          style={{
            boxShadow: "inset 0 0 24px rgba(255,255,255,0.10), inset 0 0 60px rgba(255,255,255,0.08)",
          }}
        />
        {icon && (
          <span className="flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="relative z-1">{children}</span>
      </button>
    )
  },
)

PremiumButton.displayName = "PremiumButton"

export { PremiumButton }
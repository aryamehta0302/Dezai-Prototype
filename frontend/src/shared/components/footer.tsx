import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-white">
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-on-surface font-[family-name:var(--font-heading)]">
                Dezai<span className="text-primary">.ai</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              University-grade micro-credentials platform bridging academic theory and industry demand.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link href="/catalog" className="text-sm text-muted hover:text-primary transition-colors">Course Catalog</Link></li>
              <li><Link href="/institutions" className="text-sm text-muted hover:text-primary transition-colors">Partner Universities</Link></li>
              <li><Link href="/about" className="text-sm text-muted hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/help" className="text-sm text-muted hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/accreditation" className="text-sm text-muted hover:text-primary transition-colors">Accreditation</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-4">Connect</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-muted">hello@dezai.ai</span></li>
              <li><span className="text-sm text-muted">Vadodara, Gujarat, India</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Dezai AI. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            English (India)
          </p>
        </div>
      </div>
    </footer>
  );
}

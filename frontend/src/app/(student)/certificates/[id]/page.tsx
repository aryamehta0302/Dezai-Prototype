"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { credentialsService } from "@/features/credentials/services/credentials.service";
import { Award, CheckCircle, Shield, Download, Share2, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [credential, setCredential] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    credentialsService.getCredentialDetails(id)
      .then(setCredential)
      .catch((err) => setError(err.message || "Failed to load credential"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!certRef.current || !credential) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Strip oklch/lab color rules that html2canvas can't parse (Tailwind v4+)
        onclone: (_doc, element) => {
          const sheets = element.ownerDocument.styleSheets;
          for (const sheet of Array.from(sheets)) {
            try {
              const rules = Array.from(sheet.cssRules || []);
              for (let i = rules.length - 1; i >= 0; i--) {
                const text = rules[i].cssText;
                if (text.includes("oklch(") || text.includes(" lab(")) {
                  try { sheet.deleteRule(i); } catch { /* cross-origin */ }
                }
              }
            } catch { /* cross-origin stylesheet */ }
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`certificate-${credential.verificationCode}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Try using Ctrl+P to print.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4 text-center">
        <Shield className="h-16 w-16 text-muted" />
        <h2 className="text-2xl font-bold text-on-surface">Certificate Not Found</h2>
        <p className="text-muted">{error || "This credential does not exist."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Certificate Card — captured for PDF */}
        <div ref={certRef} className="relative bg-white border border-primary/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-secondary" />

          <div className="p-10 text-center space-y-6">
            {/* Badge */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                <Award className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Certificate of Completion</p>
              <h1 className="text-4xl font-bold text-gray-900">
                {credential.user?.name || "Student"}
              </h1>
              <p className="text-gray-500 text-sm">{credential.user?.email}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 space-y-2">
              <p className="text-gray-500 text-sm">has successfully completed</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {credential.program?.title || "Program"}
              </h2>
              {credential.institution?.name && (
                <p className="text-gray-500 text-sm">
                  offered by <span className="font-semibold text-gray-900">{credential.institution.name}</span>
                </p>
              )}
            </div>

            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="text-gray-500">Issued On</p>
                <p className="font-semibold text-gray-900">
                  {new Date(credential.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tier</p>
                <p className="font-semibold text-gray-900 capitalize">{credential.tier?.toLowerCase() || "Standard"}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <div className="flex items-center gap-1 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-600">Verified</span>
                </div>
              </div>
            </div>

            {/* Verification Code */}
            <div className="bg-gray-100 rounded-xl px-6 py-3 inline-block mx-auto">
              <p className="text-xs text-gray-500 mb-1">Verification Code</p>
              <p className="font-mono font-bold text-gray-900 tracking-wider">{credential.verificationCode}</p>
            </div>

            <p className="text-xs text-gray-400 pt-2">
              Issued by DezAI · Verify at dezai.com/verify/{credential.verificationCode}
            </p>
          </div>

          {/* Bottom gradient bar */}
          <div className="h-1 bg-gradient-to-r from-secondary via-primary/50 to-primary" />
        </div>

        {/* Action Buttons — outside the PDF capture area */}
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open(`/verify/${credential.verificationCode}`, "_blank")}
          >
            <Shield className="h-4 w-4" />
            Verify
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert("Link copied!"))}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}

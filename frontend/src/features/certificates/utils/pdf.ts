import { jsPDF } from "jspdf";
import { MockCertificate } from "@/lib/mock-data/certificates";
import { formatDate } from "@/shared/utils/format";

export function downloadCertificatePDF(cert: MockCertificate) {
  // Create PDF in landscape mode (A4 format)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~210mm

  // Background color - Off-white / Soft cream cream
  doc.setFillColor(253, 253, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Determine border colors based on tier
  let borderR = 180, borderG = 83, borderB = 9; // Default TIER_2 (Amber)
  if (cert.tier === "TIER_1") {
    borderR = 14; borderG = 116; borderB = 144; // Foundational (Cyan)
  } else if (cert.tier === "TIER_3") {
    borderR = 21; borderG = 128; borderB = 61; // Professional (Green)
  }

  // Outer double border - Outer thin / Inner thick
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setLineWidth(2.0);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setLineWidth(0.5);
  doc.rect(10.5, 10.5, pageWidth - 21, pageHeight - 21);

  // Dashed inner line border
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setLineWidth(0.25);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);
  doc.setLineDashPattern([], 0); // reset

  // Decorative L-shape corners
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setLineWidth(0.5);
  // Top-left
  doc.line(16, 16, 32, 16);
  doc.line(16, 16, 16, 32);
  // Top-right
  doc.line(pageWidth - 16, 16, pageWidth - 32, 16);
  doc.line(pageWidth - 16, 16, pageWidth - 16, 32);
  // Bottom-left
  doc.line(16, pageHeight - 16, 32, pageHeight - 16);
  doc.line(16, pageHeight - 16, 16, pageHeight - 32);
  // Bottom-right
  doc.line(pageWidth - 16, pageHeight - 16, pageWidth - 32, pageHeight - 16);
  doc.line(pageWidth - 16, pageHeight - 16, pageWidth - 16, pageHeight - 32);

  // University Header
  // Graduation Cap Vector Icon
  doc.setFillColor(180, 83, 9); // Amber-700
  doc.triangle(pageWidth / 2, 16, pageWidth / 2 - 5, 18.5, pageWidth / 2, 21, "F");
  doc.triangle(pageWidth / 2, 16, pageWidth / 2 + 5, 18.5, pageWidth / 2, 21, "F");
  doc.triangle(pageWidth / 2 - 2.5, 20, pageWidth / 2 + 2.5, 20, pageWidth / 2, 22.5, "F");
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.35);
  doc.line(pageWidth / 2, 18.5, pageWidth / 2 + 4.5, 21);
  doc.line(pageWidth / 2 + 4.5, 21, pageWidth / 2 + 4.5, 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(cert.universityName, pageWidth / 2, 31, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(borderR, borderG, borderB);
  doc.text("DEZAI ACADEMIC REGISTRY", pageWidth / 2, 37, { align: "center" });

  // Main Title
  doc.setFont("times", "italic");
  doc.setFontSize(28);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Certificate of Completion", pageWidth / 2, 51, { align: "center" });

  // Accent divider line under title
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, 55, pageWidth / 2 + 30, 55);

  // Recipient Statement
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("This credential certifies that", pageWidth / 2, 69, { align: "center" });

  // User Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(cert.userName, pageWidth / 2, 83, { align: "center" });

  // Accent line under name
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setLineWidth(0.25);
  doc.line(pageWidth / 2 - 40, 87, pageWidth / 2 + 40, 87);

  // Course completion statement
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("has successfully satisfied all academic requirements and passed the comprehensive assessment for", pageWidth / 2, 97, { align: "center" });

  // Course Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(borderR, borderG, borderB);
  doc.text(cert.courseTitle, pageWidth / 2, 107, { align: "center" });

  // Tier info
  const tierLabel = cert.tier === "TIER_1" ? "Foundational" : cert.tier === "TIER_2" ? "Academic" : "Professional";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued with the verification tier: ${tierLabel}`, pageWidth / 2, 114, { align: "center" });

  // Registrar Signature Line (Left)
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85);
  doc.text("Dezai Registry", pageWidth / 2 - 65, 140, { align: "center" });

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.25);
  doc.line(pageWidth / 2 - 90, 144, pageWidth / 2 - 40, 144);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("OFFICE OF REGISTRAR", pageWidth / 2 - 65, 148, { align: "center" });

  // Golden Seal (Center)
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.5);
  doc.circle(pageWidth / 2, 140, 9, "FD");

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.25);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.circle(pageWidth / 2, 140, 8, "D");
  doc.setLineDashPattern([], 0); // reset

  // Award Ribbon Vector Icon Inside Seal
  doc.setDrawColor(180, 83, 9); // Amber-700
  doc.setLineWidth(0.5);
  doc.circle(pageWidth / 2, 137.5, 3.2, "D"); // Award circle outline
  // Ribbon Tails
  doc.line(pageWidth / 2 - 1.2, 140, pageWidth / 2 - 2.8, 144);
  doc.line(pageWidth / 2 - 2.8, 144, pageWidth / 2 - 1.2, 143.2);
  doc.line(pageWidth / 2 - 1.2, 143.2, pageWidth / 2, 140.2);

  doc.line(pageWidth / 2 + 1.2, 140, pageWidth / 2 + 2.8, 144);
  doc.line(pageWidth / 2 + 2.8, 144, pageWidth / 2 + 1.2, 143.2);
  doc.line(pageWidth / 2 + 1.2, 143.2, pageWidth / 2, 140.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  doc.text("SECURE VERIFIED", pageWidth / 2, 154, { align: "center" });

  // Instructor Signature Line (Right)
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85);
  doc.text(cert.instructorName, pageWidth / 2 + 65, 140, { align: "center" });

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.25);
  doc.line(pageWidth / 2 + 40, 144, pageWidth / 2 + 90, 144);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("AUTHORIZED INSTRUCTOR", pageWidth / 2 + 65, 158 - 10, { align: "center" });

  // Stats / Metrics Table
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.25);
  doc.rect(40, 162, pageWidth - 80, 14);

  // Vertical dividers
  doc.line(40 + (pageWidth - 80)/3, 162, 40 + (pageWidth - 80)/3, 176);
  doc.line(40 + 2 * (pageWidth - 80)/3, 162, 40 + 2 * (pageWidth - 80)/3, 176);

  // Headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("GRADE", 40 + (pageWidth - 80)/6, 166, { align: "center" });
  doc.text("EXAMINATION SCORE", 40 + (pageWidth - 80)/2, 166, { align: "center" });
  doc.text("ISSUE DATE", 40 + 5 * (pageWidth - 80)/6, 166, { align: "center" });

  // Values
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(cert.grade, 40 + (pageWidth - 80)/6, 172, { align: "center" });
  doc.text(`${cert.score}%`, 40 + (pageWidth - 80)/2, 172, { align: "center" });
  doc.text(formatDate(cert.issuedAt), 40 + 5 * (pageWidth - 80)/6, 172, { align: "center" });

  // Footer / Ledger Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate ID: ${cert.id}`, pageWidth / 2, 186, { align: "center" });
  doc.text(`Verify digital authenticity at: dezai.ai/verify/${cert.id}`, pageWidth / 2, 191, { align: "center" });

  // Download PDF
  doc.save(`Dezai-Certificate-${cert.id}.pdf`);
}

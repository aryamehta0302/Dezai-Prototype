"use client";

import { QRCodeSVG } from "qrcode.react";

interface CertificateQRCodeProps {
  certificateId: string;
  size?: number;
}

export function CertificateQRCode({ certificateId, size = 128 }: CertificateQRCodeProps) {
  const verifyUrl = `https://dezai.ai/verify/${certificateId}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl bg-white p-3 border border-border-light">
        <QRCodeSVG
          value={verifyUrl}
          size={size}
          level="M"
          bgColor="transparent"
          fgColor="#0a1628"
        />
      </div>
      <p className="text-xs text-muted text-center">
        Scan to verify this certificate
      </p>
    </div>
  );
}

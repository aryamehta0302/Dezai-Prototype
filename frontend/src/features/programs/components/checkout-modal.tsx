"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { useEnrollment } from "../hooks/useEnrollment";
import { CheckCircle, CreditCard, Loader2, Lock } from "lucide-react";
import type { ApiProgram } from "../types/program.types";

interface CheckoutModalProps {
  course: ApiProgram;
  open: boolean;
  onClose: () => void;
}

export function CheckoutModal({ course, open, onClose }: CheckoutModalProps) {
  const { handleEnroll } = useEnrollment();
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  const handlePayment = async () => {
    setStatus("processing");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const success = await handleEnroll(course.id, course.title);
    if (success) {
      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 2000);
    } else {
      setStatus("idle");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
          setStatus("idle");
        }
      }}
    >
      <DialogContent className="gap-0 p-0" style={{ width: "min(calc(100vw - 2rem), 480px)" }}>
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center space-y-4 px-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-on-surface">Enrollment Successful!</h3>
              <p className="text-sm text-muted">
                You&apos;re now enrolled in <span className="font-semibold text-on-surface">&quot;{course.title}&quot;</span>.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="border-b border-border-light px-5 py-4 pr-12 sm:px-6">
              <DialogTitle className="text-xl leading-tight">Complete Enrollment</DialogTitle>
              <DialogDescription className="text-sm">
                Review and confirm enrollment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="space-y-4 rounded-lg border border-border-light bg-surface-low p-4 sm:p-5">
                <div className="space-y-2">
                  <h4 className="break-words text-sm font-semibold text-on-surface">
                    {course.title}
                  </h4>
                  <p className="text-xs text-muted">
                    {course.institution?.name}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 rounded-lg border border-warning-container bg-warning-container/40 p-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-xs text-on-surface-variant">
                  Free enrollment. No payment required.
                </p>
              </div>

              <Button
                className="h-12 w-full gap-2 text-base font-semibold"
                size="lg"
                onClick={handlePayment}
                disabled={status === "processing"}
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Confirm Enrollment
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

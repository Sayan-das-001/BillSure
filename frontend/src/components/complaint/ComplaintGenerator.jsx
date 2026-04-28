import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, ShieldAlert } from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Loader from "../common/Loader";

export default function ComplaintGenerator({ auditResult }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [complaintText, setComplaintText] = useState(null);
  const [error, setError] = useState(null);

  const generateComplaint = async () => {
    if (!auditResult) {
      setError("Please analyze a bill first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setComplaintText(null);

    try {
      const response = await fetch("/api/generate-complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: "",
          auditResult: auditResult,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate complaint");
      }

      const data = await response.json();
      setComplaintText(data.complaintText || "");
    } catch (err) {
      console.error("Complaint generation error:", err);
      setError(err.message || "Failed to generate complaint.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!complaintText) {
      setError("No complaint text available.");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const patientName = (auditResult?.patient_name && typeof auditResult.patient_name === 'string' && auditResult.patient_name.trim())
        ? auditResult.patient_name.trim()
        : 'Patient Name Not Available';

      const response = await fetch("/api/generate-complaint-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintText,
          patient_name: patientName
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate PDF";
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.details || errorMessage;
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("Empty PDF received");
      }

      if (blob.type && blob.type !== "application/pdf") {
        throw new Error("Invalid PDF received");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "medical_complaint.pdf";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      setError(err.message || "Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card hover>
      <div className="text-left">
        <p className="section-label mb-3">Complaint Workflow</p>
        <h2 className="font-display text-2xl font-semibold text-[#0A2540] sm:text-3xl">
          Generate Complaint
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          Create a formal complaint letter from the verified audit output and download it as a PDF when ready.
        </p>
      </div>

      {!auditResult && (
        <div className="mb-4 mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-800">
          Please analyze a bill first to generate a complaint.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {auditResult && (
          <Button
            onClick={generateComplaint}
            disabled={isGenerating}
            variant="primary"
            className="w-full"
          >
            <FileText className="w-4 h-4" />
            Generate Formal Complaint
          </Button>
        )}

        {isGenerating && <Loader label="Drafting your complaint letter..." compact />}

        <AnimatePresence mode="wait">
          {complaintText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5"
            >
              <h3 className="mb-2 font-display text-lg font-semibold text-emerald-900">
                Formal Complaint:
              </h3>
              <div className="custom-scrollbar mb-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-white/90 p-4 text-sm leading-7 text-slate-800 break-words">
                {complaintText}
              </div>
              <Button
                onClick={downloadPDF}
                disabled={isDownloading || !complaintText || complaintText.trim().length === 0}
                variant="secondary"
                className="w-full"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Generating PDF..." : "Download Complaint PDF"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-700 break-words"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>
    </Card>
  );
}

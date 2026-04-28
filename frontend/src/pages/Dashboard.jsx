import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, BadgeCheck, ShieldPlus } from 'lucide-react';
import UploadCard from '../components/upload/UploadCard';
import ComplaintGenerator from '../components/complaint/ComplaintGenerator';
import SavingsCard from '../components/analysis/SavingsCard';
import ResultsTable from '../components/analysis/ResultsTable';
import Card from '../components/common/Card';
import { getLanguageByCode } from '../constants/languages';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile, errorMessage = null) => {
    setFile(selectedFile);
    setError(errorMessage);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError(t('upload.error_no_file'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('bill', file);

      const currentLang = getLanguageByCode(i18n.language) || getLanguageByCode('en') || { englishName: 'English' };
      formData.append('language', currentLang.englishName || 'English');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI service is busy. Please try again.');
      }

      const data = await response.json();
      if (data.audit) {
        setAnalysis({ ...data.audit, complaintText: data.complaintText });
      } else {
        setAnalysis(data);
      }
    } catch (err) {
      setError(err.message || 'AI service is busy. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis) {
      setError('No analysis data available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const auditResult = {
        ...analysis,
        line_items: analysis.line_items || [],
        hospital_name: analysis.hospital_name || '',
        city: analysis.city || '',
        bill_date: analysis.bill_date || '',
        total_amount: analysis.total_amount || 0,
        potential_savings: analysis.potential_savings || 0,
        patient_name: analysis.patient_name || '',
      };

      const complaintResponse = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: '',
          auditResult: auditResult,
        }),
      });

      if (!complaintResponse.ok) {
        let errorMessage = 'Failed to generate complaint';
        try {
          const errorData = await complaintResponse.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${complaintResponse.status}`;
        }
        throw new Error(errorMessage);
      }

      let complaintData;
      try {
        complaintData = await complaintResponse.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      const complaintText = complaintData?.complaintText;

      if (!complaintText) {
        throw new Error('No complaint text generated');
      }

      const patientName = (analysis.patient_name && typeof analysis.patient_name === 'string' && analysis.patient_name.trim())
        ? analysis.patient_name.trim()
        : 'Patient Name Not Available';

      const pdfResponse = await fetch('/api/generate-complaint-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintText,
          patient_name: patientName,
        }),
      });

      if (!pdfResponse.ok) {
        let errorMessage = 'Failed to generate PDF';
        try {
          const errorText = await pdfResponse.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.details || errorMessage;
          }
        } catch (e) {
          errorMessage = `Server error: ${pdfResponse.status}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await pdfResponse.blob();

      if (!blob || blob.size === 0) {
        throw new Error('Empty PDF received');
      }

      if (blob.type && blob.type !== 'application/pdf') {
        throw new Error('Invalid PDF received');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medical_complaint.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
      console.error('PDF generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_18px_32px_-22px_rgba(10,37,64,0.32)] backdrop-blur-xl">
                <Activity className="h-4 w-4 text-[#2EC4B6]" />
                AI Medical Review
              </div>
              <h1 className="text-balance font-display text-4xl font-bold tracking-tight text-[#0A2540] sm:text-5xl">
                Smart Medical Bill Verification
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                AI-powered analysis to detect overcharging and ensure fair pricing.
              </p>
            </div>

            <Card className="border-white/70 bg-white/76">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: ShieldPlus,
                    title: 'Secure intake',
                    text: 'Upload hospital bills safely without changing your workflow.',
                  },
                  {
                    icon: BadgeCheck,
                    title: 'Verified insights',
                    text: 'Understand flagged charges with cleaner visual summaries.',
                  },
                  {
                    icon: Activity,
                    title: 'Faster action',
                    text: 'Generate complaint-ready outputs in a few clicks.',
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="text-left">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A2540]/6 text-[#0A2540]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold text-[#0A2540]">{title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>

        <div className="space-y-8 sm:space-y-10">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <UploadCard
              onFileSelect={handleFileSelect}
              onAnalyze={handleAnalyze}
              file={file}
              loading={loading}
              error={error}
            />
            <Card className="h-full">
              <div className="text-left">
                <p className="section-label mb-3">What You Get</p>
                <h2 className="font-display text-2xl font-semibold text-[#0A2540] sm:text-3xl">
                  Clean, guided verification output.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  BillSure highlights suspicious charges, organizes verified items, and keeps your next action one click away.
                </p>
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  'Clear savings snapshot with total bill context.',
                  'Card-based item review with verified and flagged states.',
                  'Complaint generation flow that stays connected to your audit result.',
                ].map((item) => (
                  <div key={item} className="rounded-[24px] border border-[#0A2540]/8 bg-white/85 p-4 text-left text-sm leading-7 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <SavingsCard analysis={analysis} />
              <ResultsTable analysis={analysis} onDownloadPDF={handleDownloadPDF} />
              <ComplaintGenerator auditResult={analysis} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

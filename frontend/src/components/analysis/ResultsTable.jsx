import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building2, CalendarDays, Download, UserRound } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ResultCard from './ResultCard';

export default function ResultsTable({ analysis, onDownloadPDF }) {
  const { t } = useTranslation();
  const lineItems = analysis?.line_items || [];
  const flaggedItems = lineItems.filter(item => item.flagged);
  const summaryCards = [
    {
      label: t('analysis.hospital'),
      value: analysis?.hospital_name || 'Not available',
      icon: Building2,
    },
    {
      label: t('analysis.patient'),
      value: analysis?.patient_name || 'Not available',
      icon: UserRound,
    },
    {
      label: t('analysis.date'),
      value: analysis?.bill_date || 'Not available',
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="space-y-6">
          <div className="flex flex-col gap-3 text-left md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label mb-3">Patient Snapshot</p>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl">
                {t('analysis.bill_info')}
              </h3>
            </div>
            <div className="inline-flex items-center rounded-full bg-[#0A2540] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-[0_18px_32px_-20px_rgba(10,37,64,0.8)]">
              {flaggedItems.length} {t('analysis.flagged_count')}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {summaryCards.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex h-full flex-col rounded-[24px] border border-[#0A2540]/8 bg-white/85 p-5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A2540]/6 text-[#0A2540]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="section-label mb-3">{label}</p>
                <p className="break-words text-base font-semibold leading-7 text-[#0A2540]">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-5"
      >
        <div className="flex flex-col gap-3 text-left md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label mb-3">Item Review</p>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl">
              {t('analysis.items_title')}
            </h3>
          </div>
          {analysis?.potential_savings > 0 && lineItems.length > 0 && (
            <Button onClick={onDownloadPDF} variant="secondary" className="w-full md:w-auto">
              <Download className="h-4 w-4" />
              {t('analysis.download_complaint')}
            </Button>
          )}
        </div>

        {lineItems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lineItems.map((item, index) => (
              <ResultCard key={`${item.service}-${index}`} item={item} index={index} />
            ))}
          </div>
        ) : (
          <Card className="text-left">
            <p className="section-label mb-3">Analysis</p>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">{t('analysis.no_items')}</p>
          </Card>
        )}
      </motion.section>
    </div>
  );
}

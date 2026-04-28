import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingDown, IndianRupee, ReceiptText } from 'lucide-react';

export default function SavingsCard({ analysis }) {
  const { t } = useTranslation();
  const savings = analysis?.potential_savings || 0;
  const totalAmount = analysis?.total_amount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A2540] via-[#123758] to-[#2EC4B6] p-6 shadow-[0_28px_60px_-28px_rgba(10,37,64,0.75)] sm:p-8"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-white/10" />

      <div className="relative z-10 text-white">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Savings Snapshot
            </p>
            <h3 className="mt-3 text-xl font-semibold opacity-95 sm:text-2xl">
              {t('analysis.savings_title')}
            </h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/14 backdrop-blur-sm">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8 flex items-end gap-2"
        >
          <IndianRupee className="mb-1 h-7 w-7 sm:h-8 sm:w-8" />
          <span className="font-display text-4xl font-bold sm:text-5xl md:text-6xl">
            {savings.toFixed(2)}
          </span>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white/12 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white/70">
              <ReceiptText className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t('analysis.total_amount')}</p>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">INR {totalAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-[24px] bg-white/12 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white/70">
              <TrendingDown className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t('analysis.savings_percentage')}</p>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              {savings > 0 && totalAmount > 0 ? `${((savings / totalAmount) * 100).toFixed(1)}%` : '0.0%'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

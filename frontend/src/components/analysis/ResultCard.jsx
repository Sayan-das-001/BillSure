import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, IndianRupee, Package2 } from 'lucide-react';

export default function ResultCard({ item, index = 0 }) {
  const isFlagged = Boolean(item?.flagged);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -8 }}
      className={`flex h-full flex-col rounded-[28px] border p-6 shadow-[0_20px_45px_-28px_rgba(10,37,64,0.28)] transition-all duration-300 ${
        isFlagged
          ? 'border-rose-200 bg-gradient-to-br from-white to-rose-50/90'
          : 'border-[#0A2540]/8 bg-white/92'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 text-left">
          <p className="section-label mb-3">Title</p>
          <h3 className="break-words font-display text-xl font-semibold leading-8 text-[#0A2540]">
            {item?.service || 'Unnamed Service'}
          </h3>
        </div>
        <span
          className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
            isFlagged
              ? 'bg-rose-100 text-rose-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {isFlagged ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {isFlagged ? 'Flagged' : 'Verified'}
        </span>
      </div>

      <div className="mt-6 flex-1 rounded-[24px] bg-slate-50/90 p-4 text-left">
        <p className="section-label mb-3">Description</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/90 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Package2 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">Quantity</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-[#0A2540]">{item?.quantity || 1}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <IndianRupee className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">Price</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-[#0A2540]">
              INR {(item?.price || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-left">
        <p className="section-label mb-3">Analysis</p>
        <p className="text-sm leading-7 text-slate-600">
          {isFlagged
            ? 'This line item needs closer review because the detected charge may be higher than expected pricing.'
            : 'This line item appears consistent with the detected bill details and expected pricing patterns.'}
        </p>
      </div>
    </motion.article>
  );
}

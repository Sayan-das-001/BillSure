import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Loader({
  label = 'Processing your request...',
  className = '',
  compact = false,
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-4 text-center',
        compact ? 'py-2' : 'py-6',
        className
      )}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0A2540] to-[#2EC4B6] shadow-[0_18px_38px_-20px_rgba(10,37,64,0.7)]"
      >
        <Loader2 className="h-6 w-6 text-white" />
      </motion.div>
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
          AI Processing
        </p>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">{label}</p>
      </div>
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0A2540] via-[#143b60] to-[#2EC4B6]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

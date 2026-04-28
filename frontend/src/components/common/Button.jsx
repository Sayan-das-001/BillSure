import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3.5 sm:text-base';

  const variants = {
    primary: 'bg-gradient-to-r from-[#0A2540] via-[#143b60] to-[#2EC4B6] text-white shadow-[0_18px_36px_-18px_rgba(10,37,64,0.75)] hover:shadow-[0_22px_44px_-18px_rgba(10,37,64,0.9)]',
    secondary: 'bg-gradient-to-r from-[#2EC4B6] to-[#1aa99d] text-[#06253f] shadow-[0_18px_36px_-18px_rgba(46,196,182,0.85)] hover:shadow-[0_22px_44px_-18px_rgba(46,196,182,1)]',
    outline: 'border border-[#0A2540]/12 bg-white/70 text-[#0A2540] shadow-[0_16px_32px_-22px_rgba(10,37,64,0.35)] hover:border-[#2EC4B6]/60 hover:text-[#0A2540]',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

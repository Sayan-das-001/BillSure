import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function Card({
  children,
  className = '',
  glassmorphism = true,
  hover = false,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -6, scale: 1.01 } : undefined}
      className={clsx(
        'rounded-[28px] p-6 transition-all duration-300 md:p-8',
        glassmorphism
          ? 'surface-card glass-shadow'
          : 'bg-white shadow-[0_20px_45px_-28px_rgba(10,37,64,0.35)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

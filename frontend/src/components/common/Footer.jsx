import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-auto bg-[#0A2540] py-10 text-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-white/92">© 2026 SayanDas. All rights reserved.</p>
        <a
          href="mailto:mistersayandas001@gmail.com"
          className="text-sm text-white/80 transition hover:text-white hover:underline"
        >
          mistersayandas001@gmail.com
        </a>
        <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/80">
          <a
            href="https://github.com/Sayan-das-001"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/sayan-das-05a255316/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </motion.footer>
  );
}

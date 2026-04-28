import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Upload, Shield, TrendingDown, FileText, Sparkles, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Upload,
      titleKey: 'feature_upload.title',
      descriptionKey: 'feature_upload.description'
    },
    {
      icon: Shield,
      titleKey: 'feature_ai.title',
      descriptionKey: 'feature_ai.description'
    },
    {
      icon: TrendingDown,
      titleKey: 'feature_savings.title',
      descriptionKey: 'feature_savings.description'
    },
    {
      icon: FileText,
      titleKey: 'feature_complaint.title',
      descriptionKey: 'feature_complaint.description'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden pb-24 pt-14 sm:pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[#2EC4B6]/10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_18px_35px_-22px_rgba(10,37,64,0.38)] backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-[#2EC4B6]" />
                Trusted Healthcare AI
              </div>
              <h1 className="text-balance font-display text-4xl font-bold tracking-tight text-[#0A2540] sm:text-5xl lg:text-6xl xl:text-7xl">
                {t('home.hero_title')}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:text-xl">
                {t('home.hero_subtitle')}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/dashboard">
                  <Button variant="primary" className="min-w-[220px] text-base">
                    {t('home.get_started')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="rounded-[24px] border border-[#0A2540]/10 bg-white/70 px-5 py-4 text-left shadow-[0_18px_35px_-24px_rgba(10,37,64,0.35)] backdrop-blur-xl">
                  <p className="section-label">Precision Review</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Detect billing anomalies, estimate fair pricing, and prepare complaint-ready documentation in one place.
                  </p>
                </div>
              </div>
            </div>

            <Card hover className="overflow-hidden border-white/70 bg-white/75">
              <div className="space-y-6 text-left">
                <div>
                  <p className="section-label">Care Journey</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-[#0A2540]">
                    Premium audit experience built for patients.
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div key={index} className="rounded-[24px] border border-[#0A2540]/8 bg-white/85 p-5">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#2EC4B6] text-white">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#0A2540]">
                        {t(`home.${feature.titleKey}`)}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {t(`home.${feature.descriptionKey}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-left"
          >
            <p className="section-label mb-3">How It Works</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0A2540] sm:text-4xl">
              {t('home.how_it_works')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {t('home.how_it_works_subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="flex h-full flex-col text-left">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#2EC4B6] text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <p className="section-label mb-3">Step {index + 1}</p>
                  <h3 className="text-xl font-semibold text-[#0A2540]">
                    {t(`home.${feature.titleKey}`)}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {t(`home.${feature.descriptionKey}`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

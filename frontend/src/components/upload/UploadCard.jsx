import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, ScanSearch, ShieldCheck, Upload, X } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';

export default function UploadCard({ onFileSelect, onAnalyze, file, loading, error }) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(selectedFile.type)) {
      onFileSelect(selectedFile);
    } else {
      onFileSelect(null, t('upload.error_file_type'));
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="h-full" hover>
      <div className="flex h-full flex-col">
        <div className="mb-6 text-left">
          <p className="section-label mb-3">Upload & Verify</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl">
            {t('upload.title')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {t('upload.description')}
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-[28px] border border-dashed p-6 transition-all duration-300 sm:p-8 ${
            isDragging
              ? 'border-[#2EC4B6] bg-[#2EC4B6]/10 shadow-[0_26px_50px_-28px_rgba(46,196,182,0.9)]'
              : 'border-[#0A2540]/14 bg-white/85 hover:border-[#2EC4B6]/70 hover:bg-white'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#2EC4B6]/10" />
          <input
            ref={fileInputRef}
            type="file"
            id="file-input"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileInput}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.label
                key="upload-zone"
                htmlFor="file-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 flex cursor-pointer flex-col items-start gap-5 text-left"
              >
                <motion.div
                  animate={isDragging ? { y: [-2, 2, -2] } : {}}
                  transition={{ duration: 1, repeat: isDragging ? Infinity : 0 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#2EC4B6] text-white shadow-[0_24px_40px_-22px_rgba(10,37,64,0.8)]"
                >
                  <Upload className="h-7 w-7" />
                </motion.div>
                <div>
                  <p className="font-display text-xl font-semibold text-[#0A2540]">
                    {t('upload.drag_drop')}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                    {t('upload.or')} <span className="font-semibold text-[#0A2540]">{t('upload.browse')}</span>
                  </p>
                </div>
                <div className="grid w-full gap-3 sm:grid-cols-3">
                  {[
                    { icon: FileText, label: 'PDF / Image' },
                    { icon: ScanSearch, label: 'Deep bill scan' },
                    { icon: ShieldCheck, label: 'Secure handling' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-2xl border border-[#0A2540]/8 bg-white/80 p-4">
                      <Icon className="h-5 w-5 text-[#2EC4B6]" />
                      <p className="mt-3 text-sm font-medium text-slate-700">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.label>
            ) : (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#2EC4B6] text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-base font-semibold text-[#0A2540]">{file.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#0A2540]/10 bg-white/80 text-slate-500 transition hover:text-[#0A2540]"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-left text-sm leading-7 text-rose-700"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-6">
          {loading ? (
            <Loader label={t('upload.scanning')} />
          ) : (
            file && (
              <Button onClick={onAnalyze} variant="primary" className="w-full sm:w-auto">
                <ScanSearch className="h-4 w-4" />
                {t('upload.analyze_btn')}
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
}

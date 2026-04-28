import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Upload, File, X, Loader2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function FileUpload({ onFileSelect, onAnalyze, file, loading, error }) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
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
    <Card className="text-center">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">
        {t('upload.title')}
      </h2>
      <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg px-2">
        {t('upload.description')}
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 sm:p-8 md:p-12 transition-all duration-300
          ${isDragging 
            ? 'border-[#2563EB] bg-[#2563EB]/5 scale-105' 
            : 'border-slate-300 hover:border-[#2563EB] hover:bg-slate-50/50'
          }
        `}
      >
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center"
            >
              <motion.div
                animate={isDragging ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
              >
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-[#2563EB] mb-3 sm:mb-4" />
              </motion.div>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-700 mb-2 px-2">
                {t('upload.drag_drop')}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 px-2">
                {t('upload.or')} <span className="text-[#2563EB] font-semibold">{t('upload.browse')}</span>
              </p>
            </motion.label>
          ) : (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563EB]" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">{file.name}</p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Button
            onClick={onAnalyze}
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('upload.analyzing')}
              </span>
            ) : (
              t('upload.analyze_btn')
            )}
          </Button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin" />
            <p className="text-slate-600 font-medium">{t('upload.scanning')}</p>
            <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2563EB] to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}

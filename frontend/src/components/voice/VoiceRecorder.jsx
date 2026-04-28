import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Upload, Loader2, X, Check } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function VoiceRecorder({ onTranscription }) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
      setError(null);
      setTranscription(null);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      setError('No audio file available. Please record or upload an audio file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setTranscription(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      
      // Call the callback if provided
      if (onTranscription) {
        onTranscription(data.transcription);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setTranscription(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        🎤 Voice-to-Text
      </h2>
      <p className="text-slate-600 mb-4 sm:mb-6 text-xs sm:text-sm px-2">
        Record your voice or upload an audio file to transcribe
      </p>

      {/* Recording Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Start Recording</span>
            <span className="sm:hidden">Record</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors animate-pulse text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Stop Recording</span>
            <span className="sm:hidden">Stop</span>
          </motion.button>
        )}

        <span className="text-slate-400 text-sm sm:text-base hidden sm:inline">or</span>

        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg font-semibold transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Upload Audio</span>
          <span className="sm:hidden">Upload</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </motion.label>
      </div>

      {/* Audio Status */}
      <AnimatePresence mode="wait">
        {audioBlob && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm text-slate-700">
                  Audio ready ({(audioBlob.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <button
                onClick={reset}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcribe Button */}
      {audioBlob && !transcription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <Button
            onClick={transcribeAudio}
            disabled={isUploading}
            variant="primary"
            className="w-full"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Transcribing...
              </span>
            ) : (
              'Transcribe Audio'
            )}
          </Button>
        </motion.div>
      )}

      {/* Transcription Result */}
      <AnimatePresence mode="wait">
        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-left"
          >
            <h3 className="font-semibold text-green-900 mb-2">Transcription:</h3>
            <p className="text-slate-800 whitespace-pre-wrap">{transcription}</p>
            <button
              onClick={reset}
              className="mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
            >
              Record/Upload Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}
    </Card>
  );
}


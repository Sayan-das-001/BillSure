import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import audioUpload from '../middleware/audioUploadMiddleware.js';
import { analyzeBill, generatePdf, healthCheck } from '../controllers/billController.js';
import { transcribeAudio, transcribeVoiceComplaint } from '../controllers/voiceController.js';
import { generateFormalComplaint, generateComplaintPdf } from '../controllers/complaintController.js';

const router = express.Router();

// Analyze bill endpoint
router.post('/analyze', upload.single('bill'), analyzeBill);

// Generate PDF endpoint
router.post('/generate-pdf', generatePdf);

// Voice-to-Text transcription endpoint
router.post('/transcribe', audioUpload.single('audio'), transcribeAudio);

// Voice complaint transcription endpoint
router.post('/voice-complaint', audioUpload.single('audio'), transcribeVoiceComplaint);

// Generate formal complaint endpoint
router.post('/generate-complaint', express.json(), async (req, res) => {
  try {
    const { transcript, auditResult } = req.body;
    
    if (!auditResult) {
      return res.status(400).json({ error: 'auditResult is required' });
    }

    const complaintText = await generateFormalComplaint(transcript || '', auditResult);
    res.json({ complaintText });
  } catch (error) {
    console.error('Error generating complaint:', error);
    res.status(500).json({ 
      error: 'Failed to generate complaint',
      details: error.message 
    });
  }
});

// Generate complaint PDF endpoint
router.post('/generate-complaint-pdf', generateComplaintPdf);

// Health check endpoint
router.get('/health', healthCheck);

export default router;


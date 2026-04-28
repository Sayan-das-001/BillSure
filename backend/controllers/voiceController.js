import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Transcribe audio file to text using Groq's Whisper model
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function transcribeAudio(req, res) {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No audio file provided. Please upload an audio file.' 
      });
    }

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'GROQ_API_KEY is not configured in environment variables.' 
      });
    }

    // Create temporary file path
    const tempDir = path.join(__dirname, '../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

    try {
      // Write buffer to temporary file
      fs.writeFileSync(tempFilePath, req.file.buffer);

      // Groq SDK in Node.js can accept a File-like object or a stream
      // Create a File-like object from the buffer for better compatibility
      const audioFile = fs.createReadStream(tempFilePath);

      // Call Groq API for transcription
      // The SDK should handle the stream automatically
      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3',
        // language is optional - omit for auto-detect or specify 'hi' for Hindi, 'en' for English
        // response_format: 'json' is the default
      });

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      // Return transcription result
      // The response should have a 'text' property
      return res.status(200).json({ 
        transcription: transcription.text || transcription 
      });

    } catch (apiError) {
      // Clean up temporary file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      console.error('Groq API Error:', apiError);
      return res.status(500).json({ 
        error: 'Failed to transcribe audio. Please check your API key and try again.',
        details: apiError.message 
      });
    }

  } catch (error) {
    console.error('Transcription Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during audio transcription.',
      details: error.message 
    });
  }
}

/**
 * Transcribe audio for complaint (returns plain text only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function transcribeVoiceComplaint(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `complaint_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

    try {
      fs.writeFileSync(tempFilePath, req.file.buffer);
      const audioFile = fs.createReadStream(tempFilePath);

      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3',
      });

      fs.unlinkSync(tempFilePath);

      const transcriptText = transcription.text || '';
      return res.status(200).json({ transcript: transcriptText });

    } catch (apiError) {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      console.error('Groq API Error:', apiError);
      return res.status(500).json({ 
        error: 'Failed to transcribe audio',
        details: apiError.message 
      });
    }

  } catch (error) {
    console.error('Voice Complaint Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}


import multer from 'multer';

// Configure multer for memory storage (audio files)
const storage = multer.memoryStorage();

const audioUpload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for audio files
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg', 
      'audio/mp3', 
      'audio/wav', 
      'audio/webm', 
      'audio/ogg', 
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files (MP3, WAV, WEBM, OGG, M4A) are allowed.'));
    }
  }
});

export default audioUpload;




//routes/uploads

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { ensureUploadDir } = require('./fileUtils');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return full URL for development
  const imageUrl = `/uploads/images/${req.file.filename}`;
  res.status(200).json({ 
    imageUrl,
    fullUrl: `http://localhost:5000${imageUrl}` 
  });
});


module.exports = router;

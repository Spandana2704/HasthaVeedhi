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
  const imageUrl = `/uploads/images/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});


module.exports = router;

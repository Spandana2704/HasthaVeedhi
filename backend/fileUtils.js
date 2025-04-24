const fs = require('fs');
const path = require('path');

const ensureUploadDir = () => {
  const uploadPath = path.join(__dirname, 'uploads/images');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

module.exports = { ensureUploadDir };
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const PORT = process.env.PORT || 5000;
const path = require('path');
const app = express();
const fs = require('fs');

// 1. Create upload directory
const uploadDir = path.join(__dirname, 'uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

dotenv.config();
connectDB();

// 2. CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


// 3. Route configurations
app.use('/auth', require('./routes/auth'));
app.use('/api/products', productRoutes);

// 4. Static file serving (FIXED)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Remove redundant route configurations
// Remove these lines:
// app.use('/uploads', express.static('uploads'));
// app.use('/api/upload', require('./routes/products'));
// app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
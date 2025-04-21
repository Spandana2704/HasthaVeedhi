const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const PORT = process.env.PORT || 5000;
const path = require('path');
const app = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));

app.use('/api/products', productRoutes);

app.use('/uploads', express.static('uploads'));
app.use('/api/upload', require('./routes/upload'));

app.listen(PORT, () => console.log("Server running on port ${PORT} 🚀"));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

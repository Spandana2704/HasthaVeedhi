const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

app.use('/uploads', express.static('uploads'));
app.use('/api/upload', require('./routes/upload'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port ${PORT} 🚀"));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

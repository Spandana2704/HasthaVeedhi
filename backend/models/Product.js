const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  availability: { type: Boolean, default: true },
  discount: { type: Number, default: 0 }, // percentage
  imageUrl: String,
  image: String,
  craft: String,
  sellerId: String, // Optional if you want to track sellers
  
});

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  availability: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be less than 0%'],
    max: [100, 'Discount cannot exceed 100%']
  },
  // Update imageUrl validation in Product model
imageUrl: {
  type: String,
  required: [true, 'Image URL is required'],
  validate: {
    validator: function(v) {
      return /^(https?|ftp|^\/uploads)/.test(v); // Allow relative paths
    },
    message: props => `${props.value} is not a valid URL or local path!`
  }
},
  craft: {
    type: String,
    required: [true, 'Craft type is required'],
    // Complete the enum in Product model
enum: {
  values: [
    "Ajrakh Block Printing", "Apatani Weaving", "Aranmula Kannadi", 
    "Bandhani", "Banarasi Silk Sarees", "Bastar Iron Craft", 
    "Blue Pottery", "Chamba Rumal", "Chanderi Sarees", "Chikankari",
    "Coir Products", "Dharmavaram Silk Sarees", "Gadwal Sarees",
    "Gollabhama Sarees", "Godna Art", "Kantha Stitch", "Kondapalli Toys",
    "Kondagaon", "Madhubani Painting", "Maheshwari Sarees",
    "Manipuri Dance Costumes", "Mangalagiri Sarees", "Muga Silk Weaving",
    "Naga Shawls", "Nirmal Paintings", "Pattachitra", "Pashmina Shawls",
    "Pembarthi Brassware", "Phad Painting", "Phulkari Embroidery",
    "Pochampally sarees", "Risa and Rignai Weaving", "Shell Craft",
    "Tanjore Paintings", "Terracotta Craft", "Thangka Paintings",
    "Uppada Jamdani Sarees", "Venkatagiri Sarees", "Warli Painting"
  ],
  message: '{VALUE} is not a valid craft type'
}
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});



module.exports = mongoose.model('Product', productSchema);
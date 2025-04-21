exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    console.log("Update request for product ID:", id);  // DEBUG
    console.log("Update data:", req.body);              // DEBUG
  
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ product: updatedProduct });
      } catch (err) {
        res.status(500).json({ message: 'Failed to update product', error: err.message });
      }
    };
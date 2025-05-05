const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // 1. Fetch products with essential fields
    const products = await Product.find({})
      .select('name price craft description imageUrl availability')
      .lean();

    // 2. Prepare product knowledge string
    const productList = products.map(p => 
      `${p.name} (${p.craft}, ₹${p.price}) - ${p.description || 'No description'}`
    ).join('\n');

    // 3. Create the instruction prompt
    const instructionPrompt = `
      You are HasthaVeedhi's professional shopping assistant. Follow these rules STRICTLY:

      1. PRODUCT RULES:
      - Only recommend from these products:
      ${productList}
      - For price filters: Show ONLY products under specified price
      - For craft types: Provide educational info first, then products
      - If no matches: Say "We don't currently have items matching your request"

      2. RESPONSE FORMAT:
      - For products: List names, prices, and crafts
      - For crafts: [Explanation] + [Our products]
      - Never invent products or prices

      Current query: "${prompt}"
    `;

    // 4. Initialize model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: { temperature: 0.3 }
    });

    // 5. Generate response (using single prompt instead of chat)
    const result = await model.generateContent(instructionPrompt);
    const response = await result.response;
    const text = response.text();

    // 6. Find matching products
    const getMatchingProducts = () => {
      const lowerPrompt = prompt.toLowerCase();
      
      // Price filter
      const priceMatch = lowerPrompt.match(/under ₹?(\d+)/);
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[1]);
        return products.filter(p => p.price <= maxPrice);
      }
      
      // Craft filter
      const craftMatch = products.find(p => 
        p.craft.toLowerCase().includes(lowerPrompt) ||
        lowerPrompt.includes(p.craft.toLowerCase())
      );
      if (craftMatch) {
        return products.filter(p => 
          p.craft.toLowerCase().includes(lowerPrompt) ||
          lowerPrompt.includes(p.craft.toLowerCase())
        );
      }
      
      return [];
    };

    const matchingProducts = getMatchingProducts();

    res.json({
      reply: text,
      products: matchingProducts.slice(0, 4) // Return max 4 products
    });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ 
      reply: "I'm having technical difficulties. Please try again later.",
      products: []
    });
  }
};
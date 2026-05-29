const Product = require("../models/Product");
const Cart = require("../models/Cart");

const createProduct = async (req, res) => {
  try {
    const user = req.user;

    // 🔥 CHECK AUTH
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // =========================
    // 🔥 BULK INSERT (ARRAY)
    // =========================
    if (Array.isArray(req.body)) {
      const products = req.body.map((p) => ({
        name: p.name,
        quantity: p.quantity || 1,
        price: p.price,
        discount: p.discount || 0,
        image: p.image || "",
        description: p.description || "",

        seller: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      }));

      const result = await Product.insertMany(products);

      return res.status(201).json({
        success: true,
        count: result.length,
        products: result,
      });
    }

    // =========================
    // 🔥 SINGLE PRODUCT INSERT
    // =========================
    const { name, quantity, price, discount, image, description } = req.body;

    // 🔥 VALIDATION (important)
    if (!name || !price) {
      return res.status(400).json({
        message: "Name and Price are required",
      });
    }

    const product = await Product.create({
      name,
      quantity: quantity || 1,
      price,
      discount: discount || 0,
      image: image || "",
      description: description || "",

      seller: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // only owner can edit
    if (product.seller.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your product" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your product" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET LOGGED-IN SELLER PRODUCTS
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      "seller.id": req.user._id,
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // 👈 all products
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const search = async (req, res) => {
  try {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ message: "Search query required" });
  }

  const products = await Product.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  });

  return res.status(200).json(products);
} catch (error) {
  console.error("SEARCH ERROR:", error);

  return res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
}
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProduct,
  getAllProducts,
  search,
};

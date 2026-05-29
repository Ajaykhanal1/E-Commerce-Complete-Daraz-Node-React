const express = require("express");
const router = express.Router();

const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
  search,
} = require("../controllers/productController");

const { verifyToken, verifySeller } = require("../middleware/auth");
router.get('/search', search);


router.post("/", verifyToken, verifySeller, createProduct);
router.get("/my", verifyToken, verifySeller, getMyProducts);
// router.get("/:id", verifyToken, verifySeller, getProduct);
router.put("/:id", verifyToken, verifySeller, updateProduct);
router.delete("/:id", verifyToken, verifySeller, deleteProduct);

router.get("/", getAllProducts);
router.get("/:id", getProduct);

// Example Express backend fix


module.exports = router;
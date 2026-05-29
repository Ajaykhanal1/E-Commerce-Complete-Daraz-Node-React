const express = require("express");
const Cart = require("../models/Cart");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET CART - Fixed to return proper structure
router.get("/", verifyToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            // Return empty cart structure
            return res.json({ 
                items: [],
                userId: req.user._id
            });
        }
        
        res.json(cart);
    } catch (err) {
        console.error("Get cart error:", err);
        res.status(500).json({ message: err.message });
    }
});

// ADD TO CART
router.post("/", verifyToken, async (req, res) => {
    try {
        const { productId, name, price, image, quantity, sellerId } = req.body;
        
        // Validate required fields
        if (!productId || !name || !price || !image || !quantity || !sellerId) {
            return res.status(400).json({ 
                message: "Missing required fields: productId, name, price, image, quantity, sellerId" 
            });
        }

        let cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            // Create new cart
            cart = new Cart({
                userId: req.user._id,
                items: [{
                    productId,
                    name,
                    price,
                    image,
                    quantity,
                    sellerId
                }]
            });
        } else {
            // Check if item exists
            const itemIndex = cart.items.findIndex(
                item => item.productId === productId
            );
            
            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({
                    productId,
                    name,
                    price,
                    image,
                    quantity,
                    sellerId
                });
            }
        }
        
        await cart.save();
        res.status(200).json({ 
            message: "Item added to cart",
            cart: cart 
        });
    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE SINGLE ITEM - Fixed URL structure
router.delete("/item/:itemId", verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        
        // Remove the item
        cart.items = cart.items.filter(
            item => item._id.toString() !== req.params.itemId
        );
        
        await cart.save();
        
        res.json({ 
            message: "Item removed successfully",
            cart: cart 
        });
    } catch (err) {
        console.error("Remove item error:", err);
        res.status(500).json({ message: err.message });
    }
});

// CLEAR ALL ITEMS
router.delete("/clear", verifyToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user._id });
        res.json({ message: "Cart cleared successfully" });
    } catch (err) {
        console.error("Clear cart error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { sendOrderStatusEmail } = require("../services/emailService");


router.post("/", verifyToken, async (req, res) => {
    try {
        const user = req.user;
        const { items, customer, pricing } = req.body;

        // GROUP BY SELLER
        const sellerMap = {};

        items.forEach(item => {
            if (!sellerMap[item.sellerId]) {
                sellerMap[item.sellerId] = [];
            }
            sellerMap[item.sellerId].push(item);
        });

        const createdOrders = [];
        const sellerCount = Object.keys(sellerMap).length;

        // Calculate per-seller charges
        const perSellerDeliveryCharge = sellerCount > 0 
            ? Math.floor(pricing.deliveryCharge / sellerCount) 
            : 0;
        
        const perSellerCodCharge = sellerCount > 0 
            ? Math.floor(pricing.codCharge / sellerCount) 
            : 0;

        let remainingDelivery = pricing.deliveryCharge - (perSellerDeliveryCharge * sellerCount);
        let remainingCod = pricing.codCharge - (perSellerCodCharge * sellerCount);

        for (const sellerId in sellerMap) {
            const sellerItems = sellerMap[sellerId];
            
            // Calculate seller's subtotal
            const sellerSubtotal = sellerItems.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0
            );

            // Distribute charges (add remainder to first seller)
            let sellerDeliveryCharge = perSellerDeliveryCharge;
            let sellerCodCharge = perSellerCodCharge;
            
            if (remainingDelivery > 0) {
                sellerDeliveryCharge += 1;
                remainingDelivery--;
            }
            
            if (remainingCod > 0) {
                sellerCodCharge += 1;
                remainingCod--;
            }

            const sellerGrandTotal = sellerSubtotal + sellerDeliveryCharge + sellerCodCharge;

            const order = await Order.create({
                user: {
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                },
                sellerId,
                customer,
                items: sellerItems,
                pricing: {
                    subtotal: sellerSubtotal,
                    deliveryCharge: sellerDeliveryCharge,
                    codCharge: sellerCodCharge,
                    grandTotal: sellerGrandTotal,
                },
                status: "Pending",
            });

            createdOrders.push(order);
        }

        // Optional: Clear user's cart after successful order
        // await Cart.deleteMany({ userId: user._id });

        res.status(201).json({
            message: "Orders created per seller",
            orders: createdOrders,
        });

    } catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ message: err.message });
    }
});


// Get orders for a specific seller
router.get("/seller/:sellerId", verifyToken, async (req, res) => {
    try {
        const { sellerId } = req.params;
        console.log("Fetching orders for seller:", sellerId);
        
        const orders = await Order.find({ sellerId: sellerId }).sort({ createdAt: -1 });
        console.log(`Found ${orders.length} orders`);
        
        res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching seller orders:", err);
        res.status(500).json({ message: err.message });
    }
});

// Get single order by ID
router.get("/:orderId", verifyToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Check if user is authorized (either customer or seller)
        if (order.user.userId !== req.user._id.toString() && 
            order.sellerId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        res.status(200).json(order);
    } catch (err) {
        console.error("Error fetching order:", err);
        res.status(500).json({ message: err.message });
    }
});


// Update order status (with email notification)
router.put("/:orderId/status", verifyToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        console.log("=".repeat(50));
        console.log("Updating order status:");
        console.log("Order ID:", orderId);
        console.log("New Status:", status);
        console.log("User ID:", req.user._id);
        
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ message: "Invalid status" });
        }
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            console.log("Order not found!");
            return res.status(404).json({ message: "Order not found" });
        }
        
        console.log("Order found. Current status:", order.status);
        console.log("Order sellerId:", order.sellerId);
        console.log("Request user ID:", req.user._id.toString());
        
        // Check if user is the seller
        if (order.sellerId.toString() !== req.user._id.toString()) {
            console.log("Unauthorized! Seller ID mismatch");
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const oldStatus = order.status;
        order.status = status.toLowerCase();
        await order.save();
        
        console.log("Order status updated from", oldStatus, "to", order.status);
        
        // Send email notification
        let emailSent = false;
        if (oldStatus !== order.status) {
            console.log("Attempting to send email to:", order.user.email);
            try {
                emailSent = await sendOrderStatusEmail(order, order.status);
                console.log("Email sending result:", emailSent);
            } catch (emailError) {
                console.error("Email error details:", emailError);
                emailSent = false;
            }
        } else {
            console.log("Status unchanged, skipping email");
        }
        
        res.status(200).json({ 
            message: "Order status updated successfully",
            order,
            emailSent: emailSent
        });
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ message: err.message });
    }
});


// Get pending orders count for seller
router.get("/seller/:sellerId/pending-count", verifyToken, async (req, res) => {
    try {
        const { sellerId } = req.params;
        console.log("Counting pending orders for seller:", sellerId);
        
        const count = await Order.countDocuments({ 
            sellerId: sellerId,
            status: "pending"
        });
        
        console.log("Pending orders count:", count);
        res.status(200).json({ count });
    } catch (err) {
        console.error("Error counting pending orders:", err);
        res.status(500).json({ message: err.message });
    }
});



// Get orders for a specific customer
router.get("/customer/:userId", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Verify user is accessing their own orders
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const orders = await Order.find({ "user.userId": userId }).sort({ createdAt: -1 });
        
        res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching customer orders:", err);
        res.status(500).json({ message: err.message });
    }
});

// Cancel order (customer)
router.put("/:orderId/cancel", verifyToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Verify user owns this order
        if (order.user.userId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        // Check if order can be cancelled
        const cancellableStatuses = ["pending", "processing"];
        if (!cancellableStatuses.includes(order.status.toLowerCase())) {
            return res.status(400).json({ 
                message: `Order cannot be cancelled as it is already ${order.status}` 
            });
        }
        
        order.status = "cancelled";
        await order.save();
        
        res.status(200).json({ 
            success: true,
            message: "Order cancelled successfully",
            order 
        });
    } catch (err) {
        console.error("Error cancelling order:", err);
        res.status(500).json({ message: err.message });
    }
});




module.exports = router;
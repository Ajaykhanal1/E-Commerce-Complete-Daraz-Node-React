import { useEffect, useState } from "react";
import axios from "axios";

interface CartItem {
    _id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    sellerId: string;
}

const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCheckout, setShowCheckout] = useState(false);
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    const token = localStorage.getItem("token");

    // =========================
    // FETCH CART
    // =========================
    const fetchCart = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Fix: Backend returns cart object with items array
            const cartData = res.data;
            if (cartData && cartData.items) {
                setCartItems(cartData.items);
            } else if (Array.isArray(cartData)) {
                setCartItems(cartData);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            console.log(err);
            setError("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // REMOVE ITEM
    // =========================
    const removeItem = async (itemId: string) => {
        if (!token) return;

        try {
            await axios.delete(`http://localhost:5000/api/cart/item/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCartItems((prev) => prev.filter((item) => item._id !== itemId));
            alert("Item removed successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to remove item");
        }
    };

    // =========================
    // CALCULATIONS
    // =========================
    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    const deliveryCharge = cartItems.length > 0 ? cartItems.length * 85 : 0;
    const codCharge = subtotal > 0 ? Math.round(subtotal * 0.01) : 0;
    const grandTotal = subtotal + deliveryCharge + codCharge;

    // =========================
    // PLACE ORDER
    // =========================
    const placeOrder = async () => {
        if (!address || !phone) {
            alert("Enter address & phone");
            return;
        }

        try {
            setPlacingOrder(true);

            const orderData = {
                items: cartItems,
                customer: {
                    address,
                    phone,
                },
                pricing: {
                    subtotal,
                    deliveryCharge,
                    codCharge,
                    grandTotal,
                },
            };

            await axios.post(
                "http://localhost:5000/api/orders",
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Clear cart from backend
            await axios.delete("http://localhost:5000/api/cart/clear", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Order placed successfully!");
            setCartItems([]);
            setShowCheckout(false);
            setAddress("");
            setPhone("");
        } catch (err: any) {
            console.error("Order placement error:", err);
            alert("Order failed: " + (err.response?.data?.message || "Unknown error"));
        } finally {
            setPlacingOrder(false);
        }
    };

    // =========================
    // USE EFFECT
    // =========================
    useEffect(() => {
        fetchCart();
    }, [token]);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="mt-24 text-center text-lg">
                Loading Cart...
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================
    if (error) {
        return (
            <div className="mt-24 text-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-24 p-6">
            <h1 className="text-3xl font-bold mb-8">
                Shopping Cart
            </h1>

            {/* EMPTY CART */}
            {cartItems.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-xl shadow">
                    <h2 className="text-xl font-semibold">
                        Your cart is empty
                    </h2>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ITEMS */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                            >
                                <div className="flex gap-4 items-center">
                                    <img
                                        src={item.image}
                                        className="w-20 h-20 object-cover rounded"
                                        alt={item.name}
                                    />
                                    <div>
                                        <h2 className="font-semibold">
                                            {item.name}
                                        </h2>
                                        <p>Qty: {item.quantity}</p>
                                        <p className="text-green-600 font-bold">
                                            Rs {item.price}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeItem(item._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* SUMMARY */}
                    <div className="bg-white p-6 rounded-xl shadow h-fit sticky top-24">
                        <h2 className="text-2xl font-bold mb-6">
                            Order Summary
                        </h2>

                        <div className="flex justify-between mb-3">
                            <span>Subtotal</span>
                            <span>Rs {subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between mb-3">
                            <span>Delivery Charges (₹85 per item)</span>
                            <span>Rs {deliveryCharge.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between mb-3">
                            <span>COD Charge (1%)</span>
                            <span>Rs {codCharge.toFixed(2)}</span>
                        </div>

                        <hr className="my-3" />

                        <div className="flex justify-between mb-4">
                            <span className="font-semibold">
                                Total
                            </span>
                            <span className="text-green-600 font-bold">
                                Rs {grandTotal.toFixed(2)}
                            </span>
                        </div>

                        {/* BUY BUTTON */}
                        {!showCheckout ? (
                            <button
                                onClick={() => setShowCheckout(true)}
                                className="w-full bg-green-600 text-white py-3 mt-4 rounded hover:bg-green-700"
                            >
                                Buy Now
                            </button>
                        ) : (
                            <div className="mt-4 space-y-2">
                                <input
                                    placeholder="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />

                                <input
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />

                                <button
                                    onClick={placeOrder}
                                    disabled={placingOrder}
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {placingOrder ? "Placing..." : "Confirm Order"}
                                </button>

                                <button
                                    onClick={() => setShowCheckout(false)}
                                    className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
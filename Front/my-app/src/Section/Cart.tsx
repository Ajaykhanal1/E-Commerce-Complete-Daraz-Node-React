/* eslint-disable @typescript-eslint/no-explicit-any */
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

type PaymentMethod = "cod" | "ewallet" | null;

const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCheckout, setShowCheckout] = useState(false);
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [placingOrder, setPlacingOrder] = useState(false);

    const token = localStorage.getItem("token");

    // =========================
    // FETCH CART
    // =========================
    useEffect(() => {
        const fetchCart = async () => {
            if (!token) { setLoading(false); return; }
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:5000/api/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const cartData = res.data;
                if (cartData && cartData.items) setCartItems(cartData.items);
                else if (Array.isArray(cartData)) setCartItems(cartData);
                else setCartItems([]);
            } catch (err) {
                console.log(err);
                setError("Failed to load cart");
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [token]);

    // =========================
    // REMOVE ITEM
    // =========================
    const removeItem = async (itemId: string) => {
        if (!token) return;
        try {
            await axios.delete(`http://localhost:5000/api/cart/item/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` },
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
    const codCharge = paymentMethod === "cod" ? Math.round(subtotal * 0.01) : 0;
    const grandTotal = subtotal + deliveryCharge + codCharge;

    // =========================
    // ESEWA PAYMENT (v2)
    // =========================
    const initiateEsewaPayment = async () => {
        try {
            setPlacingOrder(true);

            const res = await axios.post("http://localhost:5000/create-payment", {
                amount: subtotal,
                deliveryCharge: deliveryCharge,
            });

            const data = res.data;

            // KEY: Save order details to localStorage BEFORE redirecting
            // Success.tsx will read this after eSewa redirects back
            const pendingOrder = {
                items: cartItems,
                customer: { address, phone },
                pricing: {
                    subtotal,
                    deliveryCharge,
                    codCharge: 0,       // no COD charge for eSewa
                    grandTotal: subtotal + deliveryCharge,
                },
            };
            localStorage.setItem("pendingEsewaOrder", JSON.stringify(pendingOrder));

            // Build and submit eSewa POST form
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

            const fields: Record<string, string> = {
                amount: data.amount.toString(),
                tax_amount: "0",
                total_amount: data.total_amount.toString(),
                transaction_uuid: data.transaction_uuid,
                product_code: "EPAYTEST",
                product_service_charge: "0",
                product_delivery_charge: data.deliveryCharge.toString(),
                success_url: `http://localhost:5173/success?transaction_uuid=${data.transaction_uuid}&total_amount=${data.total_amount}`,
                failure_url: "http://localhost:5173/failure",
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature: data.signature,
            };

            Object.entries(fields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (err: any) {
            console.error("eSewa payment init failed:", err);
            alert("Failed to initialize eSewa payment. Please try again.");
            setPlacingOrder(false);
        }
    };

    // =========================
    // PLACE ORDER (COD)
    // =========================
    const placeCodOrder = async () => {
        try {
            setPlacingOrder(true);
            const orderData = {
                items: cartItems,
                customer: { address, phone },
                pricing: { subtotal, deliveryCharge, codCharge, grandTotal },
                paymentMethod: "cod",
            };
            await axios.post("http://localhost:5000/api/orders", orderData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await axios.delete("http://localhost:5000/api/cart/clear", {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Order placed successfully!");
            setCartItems([]);
            setShowCheckout(false);
            setAddress("");
            setPhone("");
            setPaymentMethod(null);
        } catch (err: any) {
            console.error("Order placement error:", err);
            alert("Order failed: " + (err.response?.data?.message || "Unknown error"));
        } finally {
            setPlacingOrder(false);
        }
    };

    // =========================
    // CONFIRM HANDLER
    // =========================
    const handleConfirm = async () => {
        if (!address.trim() || !phone.trim()) {
            alert("Please enter your delivery address and phone number");
            return;
        }
        if (!paymentMethod) {
            alert("Please select a payment method");
            return;
        }
        if (paymentMethod === "ewallet") await initiateEsewaPayment();
        else await placeCodOrder();
    };

    if (loading) return <div className="mt-24 text-center text-lg">Loading Cart...</div>;
    if (error)   return <div className="mt-24 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto mt-24 p-6">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-xl shadow">
                    <h2 className="text-xl font-semibold">Your cart is empty</h2>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* CART ITEMS */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id}
                                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                            >
                                <div className="flex gap-4 items-center">
                                    <img src={item.image} className="w-20 h-20 object-cover rounded" alt={item.name} />
                                    <div>
                                        <h2 className="font-semibold">{item.name}</h2>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        <p className="text-green-600 font-bold">Rs {item.price}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeItem(item._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="bg-white p-6 rounded-xl shadow h-fit sticky top-24">
                        <h2 className="text-2xl font-bold mb-5">Order Summary</h2>

                        <div className="flex justify-between mb-3 text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-800">Rs {subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between mb-3 text-gray-600">
                            <span>Delivery (Rs 85 × {cartItems.length})</span>
                            <span className="font-medium text-gray-800">Rs {deliveryCharge.toFixed(2)}</span>
                        </div>

                        {paymentMethod === "cod" && (
                            <div className="flex justify-between mb-3 text-orange-600">
                                <span>COD Charge (1%)</span>
                                <span>Rs {codCharge.toFixed(2)}</span>
                            </div>
                        )}

                        <hr className="my-4" />

                        <div className="flex justify-between mb-6">
                            <span className="font-bold text-lg">Total</span>
                            <span className="text-green-600 font-bold text-lg">Rs {grandTotal.toFixed(2)}</span>
                        </div>

                        {!showCheckout ? (
                            <button onClick={() => setShowCheckout(true)}
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                            >
                                Buy Now
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    placeholder="Delivery Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                                <input
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setPaymentMethod("cod")}
                                            className={`flex-1 py-3 px-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                                                paymentMethod === "cod"
                                                    ? "border-orange-500 bg-orange-50 text-orange-700"
                                                    : "border-gray-200 text-gray-600 hover:border-orange-300"
                                            }`}
                                        >
                                            💵 Cash on Delivery
                                        </button>
                                        <button onClick={() => setPaymentMethod("ewallet")}
                                            className={`flex-1 py-3 px-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                                                paymentMethod === "ewallet"
                                                    ? "border-green-500 bg-green-50 text-green-700"
                                                    : "border-gray-200 text-gray-600 hover:border-green-300"
                                            }`}
                                        >
                                            📱 eSewa
                                        </button>
                                    </div>
                                </div>

                                {paymentMethod === "cod" && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                                        A 1% COD handling charge (Rs {codCharge}) has been added.
                                    </div>
                                )}
                                {paymentMethod === "ewallet" && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                                        You'll be securely redirected to eSewa. No extra charges apply.
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    disabled={placingOrder || !paymentMethod}
                                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                                        paymentMethod === "ewallet"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {placingOrder
                                        ? "Please wait..."
                                        : paymentMethod === "ewallet"
                                        ? "Pay with eSewa →"
                                        : "Confirm Order"}
                                </button>

                                <button
                                    onClick={() => { setShowCheckout(false); setPaymentMethod(null); }}
                                    className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200"
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
import React, { useEffect, useState } from "react";
import axios from "axios";

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    sellerId: string;
}

interface Order {
    _id: string;
    user: {
        userId: string;
        name: string;
        email: string;
    };
    customer: {
        address: string;
        phone: string;
    };
    sellerId: string;
    seller?: {
        name: string;
        email: string;
    };
    items: OrderItem[];
    pricing: {
        subtotal: number;
        deliveryCharge: number;
        codCharge: number;
        grandTotal: number;
    };
    status: string;
    createdAt: string;
}

const CustomerOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [cancellingOrder, setCancellingOrder] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const fetchOrders = async () => {
        if (!token || !userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:5000/api/orders/customer/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOrders(response.data);
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        try {
            setCancellingOrder(true);
            const response = await axios.put(
                `http://localhost:5000/api/orders/${orderId}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                alert("Order cancelled successfully!");
                fetchOrders(); // Refresh orders
                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(null);
                }
            }
        } catch (err: any) {
            console.error("Error cancelling order:", err);
            alert(err.response?.data?.message || "Failed to cancel order");
        } finally {
            setCancellingOrder(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "⏳";
            case "processing":
                return "🔄";
            case "shipped":
                return "🚚";
            case "delivered":
                return "✅";
            case "cancelled":
                return "❌";
            default:
                return "📦";
        }
    };

    const canCancel = (status: string) => {
        return ["pending", "processing"].includes(status.toLowerCase());
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredOrders = filterStatus === "all" 
        ? orders 
        : orders.filter(order => order.status.toLowerCase() === filterStatus);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {error}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl shadow text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                <a href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                    Start Shopping
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Filters */}
            <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-xl font-bold">My Orders ({orders.length})</h2>
                    
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border rounded-lg px-3 py-1 text-sm"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div
                        key={order._id}
                        className="bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer overflow-hidden"
                        onClick={() => setSelectedOrder(order)}
                    >
                        {/* Order Header */}
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Order #{order._id.slice(-8)}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)} {order.status.toUpperCase()}
                                </span>
                                {canCancel(order.status) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cancelOrder(order._id);
                                        }}
                                        disabled={cancellingOrder}
                                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 disabled:bg-red-300"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Order Content */}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-green-600">
                                        Rs {order.pricing.grandTotal.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Items</p>
                                    <p className="font-medium">{order.items.length} item(s)</p>
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="flex gap-2 mt-3">
                                {order.items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded border"
                                        />
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                                        +{order.items.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Order Details</h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Status */}
                            <div className={`p-4 rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{getStatusIcon(selectedOrder.status)}</span>
                                    <div>
                                        <p className="font-semibold">Order Status: {selectedOrder.status.toUpperCase()}</p>
                                        <p className="text-sm opacity-75">
                                            {selectedOrder.status === "pending" && "Your order is pending confirmation."}
                                            {selectedOrder.status === "processing" && "Your order is being processed."}
                                            {selectedOrder.status === "shipped" && "Your order has been shipped!"}
                                            {selectedOrder.status === "delivered" && "Your order has been delivered. Enjoy!"}
                                            {selectedOrder.status === "cancelled" && "This order has been cancelled."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-mono text-sm">{selectedOrder._id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p>{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-semibold mb-3">Items Ordered</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 border-b pb-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Quantity: {item.quantity}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Price: Rs {item.price}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    Rs {(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Order Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>Rs {selectedOrder.pricing.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Charge</span>
                                        <span>Rs {selectedOrder.pricing.deliveryCharge.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>COD Charge (1%)</span>
                                        <span>Rs {selectedOrder.pricing.codCharge.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span className="text-green-600">
                                                Rs {selectedOrder.pricing.grandTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Shipping Address</h4>
                                <div className="bg-gray-50 p-3 rounded">
                                    <p>{selectedOrder.customer.address}</p>
                                    <p>Phone: {selectedOrder.customer.phone}</p>
                                </div>
                            </div>

                            {/* Cancel Button (if applicable) */}
                            {canCancel(selectedOrder.status) && (
                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => {
                                            cancelOrder(selectedOrder._id);
                                            setSelectedOrder(null);
                                        }}
                                        disabled={cancellingOrder}
                                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:bg-red-300"
                                    >
                                        {cancellingOrder ? "Cancelling..." : "Cancel Order"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerOrders;
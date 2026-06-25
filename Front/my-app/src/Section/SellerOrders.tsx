/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LoaderIcon } from "lucide-react"


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

const SellerOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const token = localStorage.getItem("token");
    const sellerId = localStorage.getItem("userId");

    const fetchOrders = async () => {
        if (!token || !sellerId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:5000/api/orders/seller/${sellerId}`,
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

    const getStatusMessage = (currentStatus: string, newStatus: string) => {
        const messages: { [key: string]: string } = {
            pending: `Are you sure you want to change order status from ${currentStatus.toUpperCase()} to PENDING?`,
            processing: `Are you sure you want to change order status from ${currentStatus.toUpperCase()} to PROCESSING?\n\nThe customer will be notified via email.`,
            shipped: `Are you sure you want to change order status from ${currentStatus.toUpperCase()} to SHIPPED?\n\nThe customer will receive a shipping confirmation email.`,
            delivered: `Are you sure you want to change order status from ${currentStatus.toUpperCase()} to DELIVERED?\n\nThe customer will be notified that their order has been delivered.`,
            cancelled: `⚠️ WARNING: Are you sure you want to CANCEL this order from ${currentStatus.toUpperCase()}?\n\nThis action cannot be undone and will notify the customer.`
        };
        return messages[newStatus] || `Are you sure you want to change status from ${currentStatus.toUpperCase()} to ${newStatus.toUpperCase()}?`;
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        // Find the current order to get its status
        const currentOrder = orders.find(order => order._id === orderId);
        if (!currentOrder) return;

        // Show confirmation dialog with current status
        const confirmed = window.confirm(getStatusMessage(currentOrder.status, newStatus));
        if (!confirmed) {
            return;
        }

        try {
            setUpdatingStatus(true);
            setUpdatingOrderId(orderId);

            const response = await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update only the specific order in the list - NO FULL RE-RENDER
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            // Update selected order if it's the one being modified
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }

            // Show success message
            if (response.data.emailSent) {
                alert(`✅ Order status updated to ${newStatus.toUpperCase()}!\n\n📧 Email notification sent to customer.`);
            } else {
                alert(`✅ Order status updated to ${newStatus.toUpperCase()}!\n\n⚠️ Email notification failed to send, but status has been updated.`);
            }
        } catch (err: any) {
            console.error("Error updating status:", err);
            alert(`❌ Failed to update status: ${err.response?.data?.message || "Unknown error"}`);
        } finally {
            setUpdatingStatus(false);
            setUpdatingOrderId(null);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", updatingStatus);

        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [updatingStatus]);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading orders...</p>
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
            <div className="bg-white p-8 rounded-xl shadow text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500">You haven't received any orders for your products.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-6">My Orders ({orders.length})</h2>

                {/* Orders Grid */}
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${updatingOrderId === order._id ? "opacity-50" : ""
                                }`}
                            onClick={() => setSelectedOrder(order)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order #{order._id.slice(-8)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)} {order.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-medium">{order.user.name}</p>
                                    <p className="text-sm text-gray-600">{order.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-lg font-bold text-green-600">
                                        Rs {order.pricing.grandTotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-3">
                                <p className="text-sm text-gray-500 mb-2">Items ({order.items.length})</p>
                                <div className="flex flex-wrap gap-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity} × Rs {item.price}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2 w-10 h-10">
                                            <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Show updating indicator on the specific order card */}
                            {updatingOrderId === order._id && (
                                <div className="mt-3 pt-3 border-t flex items-center justify-center gap-2 text-blue-500">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    <span className="text-sm">Updating status...</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
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
                            {/* Order Status Display */}
                            <div className={`p-4 rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getStatusIcon(selectedOrder.status)}</span>
                                    <div>
                                        <p className="font-semibold">Current Status: {selectedOrder.status.toUpperCase()}</p>
                                        <p className="text-sm opacity-75">
                                            {selectedOrder.status === "pending" && "Order is waiting for confirmation."}
                                            {selectedOrder.status === "processing" && "Order is being processed."}
                                            {selectedOrder.status === "shipped" && "Order has been shipped to customer."}
                                            {selectedOrder.status === "delivered" && "Order has been delivered."}
                                            {selectedOrder.status === "cancelled" && "Order has been cancelled."}
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
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p>{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p>{selectedOrder.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p>{selectedOrder.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p>{selectedOrder.customer.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p>{selectedOrder.customer.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Items</h4>
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

                            {/* Pricing */}
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

                            {/* Update Status */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Update Order Status</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(selectedOrder._id, status)}
                                            disabled={updatingStatus || selectedOrder.status === status}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${selectedOrder.status === status
                                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                : status === "cancelled"
                                                    ? "bg-red-500 text-white hover:bg-red-600"
                                                    : "bg-blue-500 text-white hover:bg-blue-600"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {updatingStatus && updatingOrderId === selectedOrder._id && (
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                            )}
                                            {getStatusIcon(status)} {status.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {updatingStatus && (
                <div className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center gap-4">
                    <LoaderIcon className="w-16 h-16 text-white animate-spin" />
                    <p className="text-white text-lg font-medium">
                        Updating Order Status...
                    </p>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
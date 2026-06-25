import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerProducts from "./SellerProducts";
import AddProduct from "./AddProduct";
import SellerOrders from "./SellerOrders";

interface User {
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    avatar?: string;
    addresses?: string[];
    payments?: string[];
    role: string;
    orders?: { id: string; status: string; amount: number }[];
    wishlist?: string[];
}

const SellerBody: React.FC = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newAddress, setNewAddress] = useState("");
    const [payments, setPayments] = useState<string[]>([]);
    const [showPayForm, setShowPayForm] = useState(false);
    const [newPayment, setNewPayment] = useState("");

    // FIX: count pending orders from the same endpoint SellerOrders already uses
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

    const [formData, setFormData] = useState({ name: "", phone: "", gender: "" });
    const [originalData, setOriginalData] = useState({ name: "", phone: "", gender: "" });

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const tabs = ["profile", "addresses", "products", "add-product", "payments", "orders", "logout"];

    // =====================
    // FETCH USER
    // =====================
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/auth/user/${userId}`);
                const data = res.data.user || res.data;
                setUser(data);
            } catch (err) {
                console.log("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchUser();
    }, [userId]);

    // =====================
    // FETCH PENDING ORDERS COUNT
    // FIX: use the same /seller/:id endpoint SellerOrders uses,
    // then count locally — no separate endpoint needed
    // =====================
    useEffect(() => {
        const fetchPendingCount = async () => {
            if (!userId || !token) return;
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/orders/seller/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const orders = Array.isArray(res.data) ? res.data : [];
                const pending = orders.filter(
                    (o: any) => o.status?.toLowerCase() === "pending"
                ).length;

                console.log("All orders:", orders.length, "Pending:", pending);
                setPendingOrdersCount(pending);
            } catch (err) {
                console.error("Error fetching pending count:", err);
            }
        };

        fetchPendingCount();

        // Refresh every 30 seconds so badge stays live
        const interval = setInterval(fetchPendingCount, 30000);
        return () => clearInterval(interval);
    }, [userId, token]);

    // =====================
    // SYNC FORM WHEN USER LOADS
    // =====================
    useEffect(() => {
        if (user) {
            const data = {
                name: user.name || "",
                phone: user.phone || "",
                gender: user.gender || "",
            };
            setFormData(data);
            setOriginalData(data);
            setAddresses(user.addresses || []);
            setPayments(user.payments || []);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isChanged =
        formData.name !== originalData.name ||
        formData.phone !== originalData.phone ||
        formData.gender !== originalData.gender;

    const addAddress = async () => {
        try {
            const res = await axios.post(
                `http://localhost:5000/api/auth/user/${userId}/address`,
                { address: newAddress }
            );
            setUser(res.data);
            setAddresses(res.data.addresses || []);
            setNewAddress("");
            setShowForm(false);
        } catch (err) { console.log(err); }
    };

    const deleteAddress = async (index: number) => {
        try {
            const res = await axios.delete(
                `http://localhost:5000/api/auth/user/${userId}/address/${index}`
            );
            setUser(res.data);
            setAddresses(res.data.addresses || []);
        } catch (err) { console.log(err); }
    };

    const addPayment = async () => {
        try {
            const res = await axios.post(
                `http://localhost:5000/api/auth/user/${userId}/payment`,
                { payment: newPayment }
            );
            setUser(res.data);
            setPayments(res.data.payments || []);
            setNewPayment("");
            setShowPayForm(false);
        } catch (err) { console.log(err); }
    };

    const deletePayment = async (index: number) => {
        try {
            const res = await axios.delete(
                `http://localhost:5000/api/auth/user/${userId}/payment/${index}`
            );
            setUser(res.data);
            setPayments(res.data.payments || []);
        } catch (err) { console.log(err); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-5 text-2xl font-bold text-orange-500">
                    {user?.role === "customer" ? "Customer" : "Seller"} Account
                </div>

                {tabs.map((tab) => (
                    <div
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            // Clear badge when seller opens Orders tab
                            if (tab === "orders") setPendingOrdersCount(0);
                        }}
                        className={`px-6 py-3 cursor-pointer capitalize hover:bg-orange-100 flex justify-between items-center ${
                            activeTab === tab ? "bg-orange-100 text-orange-600 font-semibold" : ""
                        }`}
                    >
                        <span>{tab.replace("-", " ")}</span>

                        {/* Red badge on Orders tab */}
                        {tab === "orders" && pendingOrdersCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                                {pendingOrdersCount}
                            </span>
                        )}
                    </div>
                ))}
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-6">

                {activeTab === "profile" && (
                    <div className="bg-white p-6 rounded-xl shadow space-y-6">
                        <h2 className="text-xl font-bold">My Profile</h2>
                        <div className="flex items-center gap-6">
                            <img
                                src={
                                    user?.avatar ||
                                    (user?.gender === "male"
                                        ? "https://tse4.mm.bing.net/th/id/OIP.w8jECei4zeK6LfTZTH6xQwHaHa?pid=Api&h=220&P=0"
                                        : user?.gender === "female"
                                        ? "https://tse2.mm.bing.net/th/id/OIP.UbrXgRODY_fcKCmn33VIfQHaHa?pid=Api&h=220&P=0"
                                        : "https://tse1.mm.bing.net/th/id/OIP.4WgyWRHRbgILOnglTklnnQHaHa?pid=Api&h=220&P=0")
                                }
                                className="w-24 h-24 rounded-full border"
                                alt="Profile"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">{user?.name}</h3>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        <form
                            className="space-y-4"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const res = await axios.put(
                                        `http://localhost:5000/api/auth/user/${userId}`,
                                        formData
                                    );
                                    const updated = res.data.user || res.data;
                                    setUser(updated);
                                    alert("Profile updated successfully");
                                } catch (err) { console.log(err); }
                            }}
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                <input className="border p-2 rounded" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
                                <input className="border p-2 rounded" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
                                <select className="border p-2 rounded" name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <button
                                disabled={!isChanged}
                                className={`px-5 py-2 rounded text-white transition ${isChanged ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === "add-product" && <AddProduct />}

                {activeTab === "addresses" && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                            <h2 className="text-xl font-bold">Address Book</h2>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setShowForm(true)}>
                                + Add New Address
                            </button>
                        </div>
                        {showForm && (
                            <div className="bg-white p-6 rounded-xl shadow space-y-3">
                                <input className="border p-2 w-full rounded" placeholder="Enter address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                                <div className="flex gap-3">
                                    <button onClick={addAddress} className="px-4 py-2 bg-green-500 text-white rounded">Save</button>
                                    <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                                </div>
                            </div>
                        )}
                        <div className="bg-white p-6 rounded-xl shadow space-y-3">
                            {addresses.length === 0 ? (
                                <p className="text-gray-500">No addresses found</p>
                            ) : (
                                addresses.map((addr, i) => (
                                    <div key={i} className="flex justify-between border p-3 rounded">
                                        <span>{addr}</span>
                                        <button onClick={() => deleteAddress(i)} className="text-red-500">Remove</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "products" && <SellerProducts />}

                {activeTab === "payments" && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                            <h2 className="text-xl font-bold">Saved Payment Methods</h2>
                            <button onClick={() => setShowPayForm(true)} className="px-4 py-2 bg-blue-500 text-white rounded">+ Add Payment</button>
                        </div>
                        {showPayForm && (
                            <div className="bg-white p-6 rounded-xl shadow space-y-3">
                                <input className="border p-2 w-full rounded" placeholder="e.g. Visa **** 1234" value={newPayment} onChange={(e) => setNewPayment(e.target.value)} />
                                <div className="flex gap-3">
                                    <button onClick={addPayment} className="px-4 py-2 bg-green-500 text-white rounded">Save</button>
                                    <button onClick={() => setShowPayForm(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                                </div>
                            </div>
                        )}
                        <div className="bg-white p-6 rounded-xl shadow space-y-3">
                            {payments.length === 0 ? (
                                <p className="text-gray-500">No payment methods found</p>
                            ) : (
                                payments.map((pay, i) => (
                                    <div key={i} className="flex justify-between border p-3 rounded">
                                        <span>{pay}</span>
                                        <button onClick={() => deletePayment(i)} className="text-red-500">Remove</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "orders" && <SellerOrders />}

                {activeTab === "logout" && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-700 mb-4">Are you sure you want to logout?</p>
                        <button
                            className="text-xl font-bold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-xl"
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("userId");
                                window.location.href = "/";
                            }}
                        >
                            Confirm Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerBody;
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

type Pay = {
    transaction_uuid: string;
    product_code: string;
    total_amount: number;
    status: string;
    ref_id: string;
};

function Success() {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState<Pay | null>(null);
    const [cartCleared, setCartCleared] = useState(false);
    const [orderSaved, setOrderSaved] = useState(false);
    const [verifyError, setVerifyError] = useState("");

    useEffect(() => {
        const transaction_uuid = searchParams.get("transaction_uuid");
        const total_amount = searchParams.get("total_amount");

        console.log("Success page params:", { transaction_uuid, total_amount });

        if (!transaction_uuid || !total_amount) {
            setVerifyError("Missing transaction details in URL.");
            return;
        }

        const verifyAndProcess = async () => {
            try {
                const token = localStorage.getItem("token");

                // 1. Verify payment with backend
                console.log("Calling verify-payment...");
                const res = await axios.post(
                    "http://localhost:5000/verify-payment",
                    {
                        transaction_uuid,
                        total_amount: Number(total_amount),
                    }
                );

                console.log("Verify response:", res.data);

                // eSewa returns status in res.data.status
                // but your backend returns the MongoDB doc — check both
                const paymentStatus = res.data.status;
                setData(res.data);

                // 2. Accept COMPLETE or PAID as success
                const isSuccess =
                    paymentStatus === "COMPLETE" ||
                    paymentStatus === "PAID" ||
                    paymentStatus === "complete" ||
                    paymentStatus === "paid";

                if (isSuccess) {
                    // 3. Save order to backend (so seller gets notified)
                    const pendingOrder = localStorage.getItem("pendingEsewaOrder");
                    console.log("Pending order from localStorage:", pendingOrder);

                    if (pendingOrder && token) {
                        const orderData = JSON.parse(pendingOrder);
                        await axios.post(
                            "http://localhost:5000/api/orders",
                            {
                                ...orderData,
                                paymentMethod: "esewa",
                                paymentStatus: "paid",
                                transaction_uuid,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setOrderSaved(true);
                        localStorage.removeItem("pendingEsewaOrder");
                    } else {
                        console.warn("No pendingEsewaOrder found in localStorage");
                    }

                    // 4. Clear cart
                    if (token) {
                        await axios.delete("http://localhost:5000/api/cart/clear", {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setCartCleared(true);
                    }
                } else {
                    console.warn("Payment not complete. Status:", paymentStatus);
                    setVerifyError(`Payment status: ${paymentStatus}. Please contact support if amount was deducted.`);
                }
            } catch (err: any) {
                console.error("Verify error:", err);
                const msg = err.response?.data?.error || err.message || "Verification failed";
                setVerifyError(msg);
            }
        };

        verifyAndProcess();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-6 rounded shadow w-96 text-center">

                {/* Still verifying */}
                {!data && !verifyError && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                        </div>
                        <h1 className="text-gray-700 text-xl font-semibold">Verifying payment...</h1>
                        <p className="text-gray-400 text-sm mt-2">Please don't close this page.</p>
                    </>
                )}

                {/* Error */}
                {verifyError && (
                    <>
                        <div className="text-red-500 text-5xl mb-3">✕</div>
                        <h1 className="text-red-600 text-2xl font-bold mb-2">Verification Failed</h1>
                        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                            {verifyError}
                        </p>
                        <a href="/cart" className="mt-5 inline-block bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                            Back to Cart
                        </a>
                    </>
                )}

                {/* Success */}
                {data && !verifyError && (
                    <>
                        <div className="text-green-500 text-5xl mb-3">✓</div>
                        <h1 className="text-green-600 text-2xl font-bold mb-1">Payment Successful</h1>

                        <div className="flex flex-col gap-1 mb-4">
                            {orderSaved && (
                                <p className="text-sm text-green-600">✓ Order saved — seller has been notified.</p>
                            )}
                            {cartCleared && (
                                <p className="text-sm text-gray-500">✓ Your cart has been cleared.</p>
                            )}
                        </div>

                        <div className="mt-2 text-left bg-gray-100 p-3 rounded space-y-1 text-sm">
                            <p><b>Transaction ID:</b> {data.transaction_uuid}</p>
                            <p><b>Total Amount:</b> Rs. {data.total_amount}</p>
                            <p><b>Product:</b> {data.product_code}</p>
                            <p>
                                <b>Status:</b>{" "}
                                <span className="text-green-600 font-semibold">{data.status}</span>
                            </p>
                            {data.ref_id && <p><b>Ref ID:</b> {data.ref_id}</p>}
                        </div>

                        <a href="/" className="mt-5 inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            Continue Shopping
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default Success;
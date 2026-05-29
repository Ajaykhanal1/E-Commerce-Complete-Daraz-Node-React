import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    discount: number;
    description: string;
    productId: string;
    seller?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    sellerId?: string;
}

const View = () => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            setAddingToCart(true);
            const token = localStorage.getItem("token");

            // IMPORTANT: Get sellerId from nested seller object
            const sellerId = product.seller?.id || product.sellerId;
            
            if (!sellerId) {
                alert("Cannot add to cart: Seller information missing");
                console.error("No seller ID found in product:", product);
                return;
            }

            const cartItem = {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                sellerId: sellerId  // Use the extracted sellerId
            };

            console.log("Adding to cart:", cartItem);

            const res = await axios.post(
                "http://localhost:5000/api/cart",
                cartItem,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Added to cart!");
            console.log(res.data);
        } catch (error: any) {
            console.error("Error adding to cart:", error);
            const errorMessage = error.response?.data?.message || "Failed to add to cart";
            alert(errorMessage);
        } finally {
            setAddingToCart(false);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/products/${id}`
                );
                console.log("Full product object:", res.data);
                setProduct(res.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <p className="p-6">Loading...</p>;
    if (!product) return <p className="p-6">Product not found</p>;

    const discountedPrice =
        product.discount > 0
            ? product.price - (product.price * product.discount) / 100
            : product.price;

    return (
        <div className="mt-30 max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-10">
            <div>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-120 h-100 object-cover rounded-2xl shadow-md"
                />
            </div>

            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-gray-800">
                    {product.name}
                </h1>

                {product.discount > 0 && (
                    <span className="bg-red-500 text-white w-fit px-3 py-1 rounded-lg text-sm">
                        {product.discount}% OFF
                    </span>
                )}

                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-green-600">
                        Rs {discountedPrice.toFixed(0)}
                    </h2>

                    {product.discount > 0 && (
                        <span className="line-through text-gray-400">
                            Rs {product.price}
                        </span>
                    )}
                </div>
                
                <p className="text-gray-700">{product.description}</p>
                
                {/* Show seller info */}
                {product.seller && (
                    <p className="text-sm text-gray-500">
                        Sold by: {product.seller.name}
                    </p>
                )}

                <div className="flex items-center gap-4 mt-4">
                    <span className="text-gray-700 font-medium">Quantity:</span>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-20 border-none focus:outline-none text-center"
                        />
                        <button
                            onClick={() => setQuantity((prev) => prev + 1)}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    {localStorage.getItem("token") ? (
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-blue-300"
                        >
                            {addingToCart ? "Adding..." : "🛒 Add to Cart"}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                        >
                            Login For Add Cart
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
};

export default View;
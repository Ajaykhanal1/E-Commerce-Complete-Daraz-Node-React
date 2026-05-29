import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  discount: number;
}

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Body: React.FC<Props> = ({ products, setProducts }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        const shuffled = res.data
          .sort(() => Math.random() - 0.5)
          .slice(0,30);

        setProducts(shuffled);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    // Only fetch if products array is empty (initial load or after search)
    if (products.length === 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, []); // Empty dependency array - runs once on mount

  if (loading) return <p className="text-center p-6">Loading...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100"
        >
          <div className="relative group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
            />

            {product.discount > 0 && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                {product.discount}% OFF
              </span>
            )}
          </div>

          <div className="p-4 flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-600">
                  Rs{" "}
                  {product.discount > 0
                    ? (
                        product.price -
                        (product.price * product.discount) / 100
                      ).toFixed(0)
                    : product.price}
                </span>

                {product.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    Rs {product.price}
                  </span>
                )}
              </div>

              <button
                onClick={() => navigate(`/view/${product._id}`)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Body;
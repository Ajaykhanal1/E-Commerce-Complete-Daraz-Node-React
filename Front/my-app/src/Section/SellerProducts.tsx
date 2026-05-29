import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  image: string;
  description: string;
}

const SellerProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // FETCH MY PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProducts(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // DELETE PRODUCT
  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(products.filter((p) => p._id !== id));
      setSelectedProduct(null);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="grid grid-cols-3 gap-6">

      {/* LEFT: PRODUCT LIST */}
      <div className="col-span-1 bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-3">My Products</h2>

        {products.map((p) => (
          <div
            key={p._id}
            onClick={() => setSelectedProduct(p)}
            className="p-2 mb-2 bg-white rounded cursor-pointer hover:bg-blue-100"
          >
            {p.name}
          </div>
        ))}
      </div>

      {/* RIGHT: PRODUCT DETAILS */}
      <div className="col-span-2 bg-white p-6 rounded shadow">
        {selectedProduct ? (
          <div className="flex gap-10">
            <div>
              <h2 className="text-xl font-bold mb-5">{selectedProduct.name}</h2>

              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-100 h-100 object-cover rounded mb-4"
                />
              )}
              <p>Price: {selectedProduct.price}</p>
              <p>Quantity: {selectedProduct.quantity}</p>
              <p>Discount: {selectedProduct.discount}%</p>

              <div className="mt-4 flex gap-3">

                {/* EDIT BUTTON (you can open modal later) */}
                <button
                  onClick={() => navigate(`/edit-product/${selectedProduct._id}`)}
                  className="bg-yellow-500 px-3 py-1 text-white rounded"
                >
                  Edit
                </button>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => {
                    const confirmDelete = window.confirm("Are you sure you want to delete this product?");

                    if (confirmDelete) {
                      deleteProduct(selectedProduct._id);
                    }
                  }}
                  className="bg-red-500 px-3 py-1 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="border-l pl-5 mt-11">
              <h3 className="font-bold mt-5 mb-2">Description:</h3>
              <p>{selectedProduct.description}</p>

            </div>
          </div>
        ) : (
          <p>Select a product</p>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
import { useState } from "react";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  discount: number;
}

interface Props {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Navbar: React.FC<Props> = ({ setProducts: setParentProducts }) => {
  const isLoggedIn = localStorage.getItem("token");
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/search?q=${query}`
      );
      
      setParentProducts(res.data); // Update parent state (Body)
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <nav className="bg-orange-500 text-white py-4">
        <div className="container mx-auto flex items-center justify-between pr-2">
          <div className="text-xl font-bold">
            <a href="/">
              <img
                className="rounded-lg p-2"
                src="https://lzd-img-global.slatic.net/us/domino/3b870cb043c7f8a9741cbf66329e294e.png"
                alt="Daraz"
                width={250}
              />
            </a>
          </div>

          <div className="bg-white p-1">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in Daraz"
                className="text-black w-130 rounded-lg focus:outline-none focus:ring-0 transition duration-200 p-2"
              />
              <button
                type="submit"
                className="ml-2 text-white bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded"
              >
                Search
              </button>
            </form>
          </div>

          <ul className="flex space-x-6 mr-2">
            <li>
              <a href="/">HOME</a>
            </li>
            <li>
              <a href="/cart">CART</a>
            </li>
            <li>
              <a href="/login">SELLER ACCOUNT</a>
            </li>

            {!isLoggedIn && (
              <li>
                <a href="/login">LOGIN</a>
              </li>
            )}
            {isLoggedIn && (
              <li>
                <a href="/profile">PROFILE</a>
              </li>
            )}
            {isLoggedIn && (
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }}
                >
                  LOGOUT
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
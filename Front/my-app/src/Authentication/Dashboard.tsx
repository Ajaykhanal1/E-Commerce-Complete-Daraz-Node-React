import { useState } from "react";

import Navbar from "../Section/CustomerNavbar"
import Body from "../Section/CustomerBody"
import Footer from "../Section/Footer"


interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  discount: number;
}


const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  return (
    <>
      <Navbar setProducts={setProducts} />
      <Body products={products} setProducts={setProducts} />
      <Footer />
    </>
  );
};  

export default Dashboard;
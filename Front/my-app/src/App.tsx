import { BrowserRouter, Routes, Route } from "react-router-dom"


import Login from "./Authentication/Login"
import Register from "./Authentication/Register"
import ForgotPassword from "./Authentication/ForgotPassword"
import Dashboard from "./Authentication/Dashboard"
import ResetPassword from "./Authentication/ResetPassword"
import Profile from "./Section/Profile"
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute"
import SellerBody from "./Section/SellerBody"
import EditProduct from "./Section/EditProduct"
import View from "./Section/View"
import Cart from "./Section/Cart"


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sellerbody" element={<ProtectedRoute><SellerBody /></ProtectedRoute>} />
          <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/view/:id" element={<View />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

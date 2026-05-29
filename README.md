# 🛒 E-Commerce Website (Daraz Clone)

A full-stack modern E-Commerce Web Application inspired by Daraz where customers can browse products, add items to cart, place orders, and track delivery status in real time. Sellers can manage products, handle orders, update shipping status, and communicate through automated email notifications.

---

# 🚀 Features

## 👤 Authentication & Authorization

* Role-based Authentication

  * Customer
  * Seller
* Secure Login & Registration
* Google Sign-In Authentication
* JWT Authentication
* Protected Routes
* Fast & Easy Authentication System

---

# 🛍️ Customer Features

## Product Browsing

* Browse all products
* Search products instantly
* View product details
* Responsive product cards
* Category-based product display

## Cart System

* Add products to cart
* Remove products from cart
* Increase/decrease quantity
* Cart total calculation
* Persistent cart management

## Checkout & Orders

* Buy products directly from cart
* Place secure orders
* Order history management
* Track order status in real time

## Order Tracking Status

Customers receive email notifications whenever seller changes order status:

* Pending
* Processing
* Shipped
* Delivered
* Cancelled

## Customer Controls

* Cancel placed orders
* View delivery updates
* Receive shipment notifications

---

# 🏪 Seller Features

## Seller Dashboard

* Seller-specific dashboard
* Manage products
* View customer orders
* Order management panel

## Product Management

* Add products
* Edit products
* Delete products
* Upload product images
* Manage stock quantity

## Order Management

Seller receives order notifications in pending status when customer places order.

Seller can update order status:

* Pending
* Processing
* Shipped
* Delivered
* Cancelled

Every status update automatically sends email notification to customer.

---

# 📧 Email Notification System

Automated email notifications are sent for:

* Order placed
* Order processing
* Order shipped
* Order delivered
* Order cancelled

This helps customers track their orders easily.

---

# 🚚 Delivery Workflow

1. Customer adds products to cart
2. Customer places order
3. Seller receives order notification
4. Order status becomes Pending
5. Seller processes order
6. Seller ships product to customer address
7. Customer receives shipment notification
8. Product gets delivered successfully

---

# 🔐 Security Features

* JWT Authentication
* Password Encryption
* Protected API Routes
* Role-based Access Control
* Secure Google Authentication

---

# 🧰 Tech Stack

## Frontend

* React.js
* TypeScript
* Tailwind CSS
* Redux Toolkit
* Axios

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## Authentication

* Google OAuth
* Firebase Authentication

## Email Service

* Nodemailer

---

# 📱 Responsive Design

* Mobile Friendly
* Tablet Responsive
* Desktop Optimized
* Modern UI/UX

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/ecommerce-website.git
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Backend Setup

```bash
cd server
npm install
npm start
```

---

# 🔑 Environment Variables

Create `.env` file inside server folder:

```env
PORT=5000

MONGO_URI=your_mongodb_url

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_email_password
```

---

---

# 🌟 Main Workflow

## Customer Flow

* Register/Login
* Search Products
* Add to Cart
* Buy Products
* Track Order
* Receive Email Notifications

## Seller Flow

* Register/Login as Seller
* Add Products
* Receive Orders
* Update Order Status
* Manage Deliveries

---

# 🎯 Future Improvements

* Online Payment Integration
* Live Chat System
* AI Product Recommendation
* Coupon System
* Wishlist Feature
* Multi-Vendor Support
* Admin Dashboard
* Real-time Notifications

---

# 📸 Screens Included

* Home Page
* Product Page
* Search System
* Cart Page
* Checkout Page
* Seller Dashboard
* Order Tracking Page
* Authentication Pages

---

# ❤️ Inspiration

This project is inspired by Daraz and modern E-Commerce platforms with full order management and seller-customer workflow system.

---

# 👨‍💻 Developer

Built with ❤️ using MERN Stack.

---

# 📄 License

This project is licensed under the MIT License.

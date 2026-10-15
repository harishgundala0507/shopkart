markdown
# 🛒 ShopKart — MERN E-Commerce Application

A full-stack e-commerce application built across 6 engineering labs. Features customer authentication, product catalog, wishlist, shopping cart, and checkout with Razorpay payment integration.

---

## 🚀 Features

- **Authentication** — JWT + HttpOnly cookies, bcrypt password hashing
- **Product Catalog** — Search, category filter, price sorting
- **Wishlist** — Save products with duplicate prevention
- **Shopping Cart** — Global state via React Context, quantity controls
- **Checkout** — Shipping form, order creation, price snapshots
- **Payments** — Razorpay Test Mode integration with signature verification
- **Orders** — Order history with status tracking

---

## 🛠 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) + bcrypt
- cookie-parser + CORS
- Razorpay SDK

### Frontend
- React (Vite)
- React Router DOM
- Axios
- Context API (global cart state)
- Tailwind CSS

---

## 📁 Project Structure
ShopKart/
├── backend/
│ ├── config/ # Razorpay configuration
│ ├── controllers/ # Business logic
│ ├── middlewares/ # Auth middleware
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ ├── utils/ # JWT generator
│ ├── index.js # Server entry point
│ └── .env.example # Environment template
│
└── shopkart-frontend/
├── src/
│ ├── components/ # Reusable UI components
│ ├── context/ # CartContext (global state)
│ ├── pages/ # Route pages
│ ├── services/ # API service layer
│ ├── App.jsx # Router + auth state
│ └── main.jsx
└── index.html

text

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Razorpay test account (optional, for payment features)

### 1. Clone the repository

```bash
git clone https://github.com/harishgundala0507/shopkart.git
cd shopkart
2. Backend Setup
bash
cd backend
npm install
Create a .env file in backend/ with:

env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
Start the backend:

bash
npm run dev
Server runs at http://localhost:5000.

3. Frontend Setup
bash
cd ../shopkart-frontend
npm install
npm run dev
Frontend runs at http://localhost:5173.

🔌 API Endpoints
Authentication (/customers)
Method	Endpoint	Auth	Purpose
POST	/register	❌	Register customer
POST	/login	❌	Login (sets HttpOnly cookie)
GET	/me	✅	Get current user
POST	/logout	✅	Logout
Products (/products)
Method	Endpoint	Purpose
POST	/	Create product
GET	/?search=&category=&sort=	List products
GET	/:id	Single product
Wishlist (/wishlist) — all protected
Method	Endpoint	Purpose
POST	/:productId	Add to wishlist
GET	/	Get my wishlist
DELETE	/:productId	Remove from wishlist
Cart (/cart) — all protected
Method	Endpoint	Purpose
POST	/:productId	Add to cart
GET	/	Get my cart
PATCH	/:productId	Update quantity
DELETE	/:productId	Remove item
Orders (/orders) — all protected
Method	Endpoint	Purpose
POST	/create-payment-order	Create pending order + Razorpay order
POST	/verify-payment	Verify Razorpay signature
GET	/	My orders
GET	/:id	Single order
🔐 Security Features
bcrypt password hashing (one-way, salted)

JWT tokens stored in HttpOnly cookies (XSS-safe)

Auth middleware on all protected routes

CORS configured with credentials

Server-side validation on all mutations

Razorpay HMAC SHA256 signature verification

Ownership checks — users cannot access other users' data

Price snapshots in orders (immune to product price changes)

📚 What I Learned
Building REST APIs with Express and Mongoose

JWT authentication with HttpOnly cookies

MongoDB relationships (references vs embeddings) and populate()

React Context API for global state management

Derived state vs stored state (subtotal, cart count)

Payment gateway integration (Razorpay) with server-side verification

Order snapshots for historical accuracy

🧪 Testing
All endpoints tested via Postman. Sample collection in postman/ folder.

⚠️ Notes
This project uses Razorpay Test Mode only — no real payments.

.env file is git-ignored. Use .env.example as a template.

📄 License
MIT — free to use for learning purposes.

text

**Save in VS Code with Ctrl + S.**

---

## Step 3: Why VS Code works better than Notepad

**Notepad:** Saves as plain text — no awareness of Markdown syntax
**VS Code:** Understands file extensions — preserves all special characters

**The key characters that need preserving:**
- Triple backticks ` ``` ` — for code blocks
- Pipe characters `|` — for tables
- Hash symbols `#` — for headers
- Backticks `` ` `` — for inline code

If any of these got stripped, your README would render wrong on GitHub (or not at all).

---

## Step 4: Verify the file saved correctly

**In VS Code, look at the README.md tab:**

- Should see the **Preview** icon (top-right of the editor — looks like a magnifying glass over a page)
- Click it — you should see a **rendered preview** with formatted headers, tables, and code blocks

**If the preview looks clean and formatted** → ✅ file is correct.

---

## Step 5: Push

In the terminal:

```bash
git add README.md
git commit -m "Fix README formatting"
git push
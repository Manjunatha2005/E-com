# 🍄 MycoMart — Mushroom E-Commerce Platform

A fully responsive mushroom order e-commerce website converted from the Organica template, featuring a rich earthy amber & forest-green design system.

---

## 📂 Project Structure

```
mycomart/
│
├── frontend/                        ← Pure HTML / CSS / JS (no build step)
│   ├── index.html                   ← Home page
│   ├── product-details.html         ← Single product page
│   ├── about.html                   ← (add as needed)
│   ├── shop.html                    ← (add as needed)
│   ├── cart.html                    ← (add as needed)
│   └── assets/
│       ├── css/
│       │   ├── main.css             ← Global styles, design tokens, header, footer
│       │   ├── home.css             ← Home-page-specific sections
│       │   └── product-details.css  ← Product detail page styles
│       ├── js/
│       │   └── script.js            ← All interactive JS (nav, cart, wishlist, filter)
│       └── images/                  ← Drop your mushroom images here
│
└── backend/                         ← Node.js / Express REST API
    ├── server.js                    ← Entry point
    ├── package.json
    ├── .env.example                 ← Copy to .env and fill values
    │
    ├── config/
    │   ├── db.js                    ← MongoDB connection
    │   └── seeder.js                ← 12 sample mushroom products
    │
    ├── models/
    │   ├── Product.js               ← Product + reviews schema
    │   ├── User.js                  ← User + addresses + wishlist schema
    │   └── Order.js                 ← Order + line items schema
    │
    ├── routes/
    │   ├── products.js              ← CRUD, search, filter, reviews
    │   ├── users.js                 ← Auth, profile, wishlist, admin
    │   └── orders.js                ← Place order, pay, deliver, admin
    │
    └── middleware/
        ├── authMiddleware.js        ← JWT protect + admin guard
        └── errorMiddleware.js       ← Global 404 + error handler
```

---

## 🎨 Design System

| Token             | Value                            | Usage               |
|-------------------|----------------------------------|---------------------|
| `--amber-primary` | `hsl(30, 85%, 48%)`              | Primary CTA, links  |
| `--amber-hover`   | `hsl(28, 80%, 40%)`              | Hover states        |
| `--soil-dark`     | `hsl(20, 22%, 10%)`              | Headings, footer bg |
| `--cream`         | `hsl(40, 35%, 95%)`              | Card backgrounds    |
| `--forest-green`  | `hsl(140, 45%, 28%)`             | Service bar         |
| `--violet-deep`   | `hsl(260, 40%, 14%)`             | Section headings    |
| Font Display      | Playfair Display (serif)         | Titles, subtitles   |
| Font Body         | Roboto (sans-serif)              | Paragraphs, UI      |

---

## 🛍️ Product Categories

| Slug          | Label                  |
|---------------|------------------------|
| `fresh`       | Fresh Mushrooms        |
| `dried`       | Dried & Preserved      |
| `medicinal`   | Medicinal / Superfood  |
| `kits`        | Home Grow Kits         |

---

## 🚀 Getting Started

### Frontend (no build step required)

```bash
# Just open in browser — or use VS Code Live Server
open frontend/index.html
```

---

### Backend

#### 1. Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

#### 2. Install & configure

```bash
cd backend
npm install

cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
```

#### 3. Seed the database (optional)

```bash
npm run seed           # Insert 12 sample mushroom products
npm run seed -- --destroy  # Wipe all data
```

#### 4. Start the server

```bash
npm run dev    # Development (nodemon, hot-reload)
npm start      # Production
```

The API will be available at `http://localhost:5000`.

---

## 📡 API Reference

### Health
```
GET  /api/health
```

### Products
```
GET    /api/products                    List all (filter, search, paginate)
GET    /api/products/featured           Featured products only
GET    /api/products/:id                Single product (id or slug)
POST   /api/products                    Create product       [admin]
PUT    /api/products/:id                Update product       [admin]
DELETE /api/products/:id                Delete product       [admin]
POST   /api/products/:id/reviews        Add review           [auth]
```

**Query parameters for GET /api/products:**

| Param      | Example             | Description                         |
|------------|---------------------|-------------------------------------|
| `category` | `fresh`             | Filter by category                  |
| `search`   | `shiitake`          | Full-text search (name + desc)      |
| `minPrice` | `10`                | Minimum price                       |
| `maxPrice` | `50`                | Maximum price                       |
| `sort`     | `price_asc`         | `price_asc`, `price_desc`, `rating`, `newest` |
| `page`     | `2`                 | Page number (default 1)             |
| `limit`    | `8`                 | Results per page (default 12)       |

### Users
```
POST   /api/users/register              Register new user
POST   /api/users/login                 Login → returns JWT
GET    /api/users/profile               Get own profile      [auth]
PUT    /api/users/profile               Update profile       [auth]
POST   /api/users/wishlist/:productId   Toggle wishlist item [auth]
GET    /api/users                       List all users       [admin]
DELETE /api/users/:id                   Delete user          [admin]
```

### Orders
```
POST   /api/orders                      Create new order     [auth]
GET    /api/orders/myorders             Get own orders       [auth]
GET    /api/orders/:id                  Get order by id      [auth]
PUT    /api/orders/:id/pay              Mark as paid         [auth]
PUT    /api/orders/:id/deliver          Mark as delivered    [admin]
PUT    /api/orders/:id/status           Update status        [admin]
GET    /api/orders                      List all orders      [admin]
DELETE /api/orders/:id                  Delete order         [admin]
```

---

## 🖼️ Adding Real Images

Replace the emoji placeholders in `index.html` with `<img>` tags pointing to your images stored in `frontend/assets/images/`. The backend also serves images from `backend/public/images/` at `/images/*`.

---

## 🔒 Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are returned from `/api/users/register` and `/api/users/login`.

---

## 🧩 Extending the Project

| Feature           | Where to add                                          |
|-------------------|-------------------------------------------------------|
| Cart persistence  | `localStorage` in `script.js`                        |
| Payment gateway   | Razorpay / Stripe webhook in `routes/orders.js`      |
| Image upload      | Multer route in `routes/products.js`                 |
| Admin dashboard   | New `admin.html` page calling `/api` endpoints       |
| Email on order    | Nodemailer in orders `POST` handler                  |

---

## 📜 License

MIT — free to use and modify.

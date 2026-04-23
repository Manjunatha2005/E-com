const express  = require('express');
const asyncH   = require('express-async-handler');
const Product  = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
// Query: ?category=fresh&search=shiitake&page=1&limit=12&sort=price_asc
router.get('/', asyncH(async (req, res) => {
  const page     = Number(req.query.page)     || 1;
  const limit    = Number(req.query.limit)    || Number(process.env.RESULTS_PER_PAGE) || 12;
  const skip     = (page - 1) * limit;

  const filter = {};

  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured) filter.isFeatured = true;
  if (req.query.search) {
    filter.$or = [
      { name:        { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Price range
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // Sorting
  const sortMap = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    rating:     { rating: -1 },
    newest:     { createdAt: -1 },
  };
  const sort = sortMap[req.query.sort] || { createdAt: -1 };

  const total    = await Product.countDocuments(filter);
  const products = await Product.find(filter).sort(sort).limit(limit).skip(skip);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    products,
  });
}));


// ─── GET /api/products/featured ───────────────────────────────────────────────
router.get('/featured', asyncH(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json(products);
}));


// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', asyncH(async (req, res) => {
  // Support both ObjectId and slug
  const query = req.params.id.match(/^[a-f\d]{24}$/i)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const product = await Product.findOne(query);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
}));


// ─── POST /api/products  (admin) ──────────────────────────────────────────────
router.post('/', protect, admin, asyncH(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));


// ─── PUT /api/products/:id  (admin) ───────────────────────────────────────────
router.put('/:id', protect, admin, asyncH(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new:        true,
    runValidators: true,
  });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
}));


// ─── DELETE /api/products/:id  (admin) ────────────────────────────────────────
router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
}));


// ─── POST /api/products/:id/reviews  (auth) ───────────────────────────────────
router.post('/:id/reviews', protect, asyncH(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) { res.status(404); throw new Error('Product not found'); }

  // Check duplicate review
  const already = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (already) { res.status(400); throw new Error('You have already reviewed this product'); }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.updateRating();
  await product.save();

  res.status(201).json({ message: 'Review added' });
}));

module.exports = router;

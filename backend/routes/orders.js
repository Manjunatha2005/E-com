const express = require('express');
const asyncH  = require('express-async-handler');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TAX_RATE      = 0.18;   // 18% GST
const FREE_SHIP_MIN = 75;     // free shipping threshold (USD)
const SHIP_COST     = 5.99;

const calcPrices = (items) => {
  const itemsPrice    = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shippingPrice = itemsPrice >= FREE_SHIP_MIN ? 0 : SHIP_COST;
  const taxPrice      = +(itemsPrice * TAX_RATE).toFixed(2);
  const totalPrice    = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);
  return { itemsPrice: +itemsPrice.toFixed(2), shippingPrice, taxPrice, totalPrice };
};


// ─── POST /api/orders  (auth) ─────────────────────────────────────────────────
router.post('/', protect, asyncH(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify stock for each item
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const prices = calcPrices(orderItems);

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    ...prices,
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: -item.qty },
    });
  }

  res.status(201).json(order);
}));


// ─── GET /api/orders/myorders  (auth) ─────────────────────────────────────────
router.get('/myorders', protect, asyncH(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}));


// ─── GET /api/orders/:id  (auth) ──────────────────────────────────────────────
router.get('/:id', protect, asyncH(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  // Non-admin can only see their own orders
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorised to view this order');
  }

  res.json(order);
}));


// ─── PUT /api/orders/:id/pay  (auth) ──────────────────────────────────────────
router.put('/:id/pay', protect, asyncH(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.isPaid         = true;
  order.paidAt         = Date.now();
  order.status         = 'confirmed';
  order.paymentResult  = {
    id:         req.body.id,
    status:     req.body.status,
    updateTime: req.body.update_time,
    email:      req.body.payer?.email_address,
  };

  const updated = await order.save();
  res.json(updated);
}));


// ─── PUT /api/orders/:id/deliver  (admin) ─────────────────────────────────────
router.put('/:id/deliver', protect, admin, asyncH(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.isDelivered    = true;
  order.deliveredAt    = Date.now();
  order.status         = 'delivered';
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;

  const updated = await order.save();
  res.json(updated);
}));


// ─── PUT /api/orders/:id/status  (admin) ──────────────────────────────────────
router.put('/:id/status', protect, admin, asyncH(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) { res.status(400); throw new Error('Invalid status'); }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json(order);
}));


// ─── GET /api/orders  (admin) ─────────────────────────────────────────────────
router.get('/', protect, admin, asyncH(async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const total  = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  // Revenue summary
  const revenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    revenue: revenue[0]?.total || 0,
    orders,
  });
}));


// ─── DELETE /api/orders/:id  (admin) ──────────────────────────────────────────
router.delete('/:id', protect, admin, asyncH(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  await order.deleteOne();
  res.json({ message: 'Order removed' });
}));

module.exports = router;

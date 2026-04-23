const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  name:         { type: String, required: true },
  image:        { type: String },
  price:        { type: Number, required: true },
  qty:          { type: Number, required: true, min: 1 },
  weightOption: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

    orderItems: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone:    String,
      line1:    String,
      line2:    String,
      city:     String,
      state:    String,
      pinCode:  String,
      country:  { type: String, default: 'India' },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ['COD', 'UPI', 'Card', 'NetBanking', 'Wallet'],
    },

    paymentResult: {
      id:         String,
      status:     String,
      updateTime: String,
      email:      String,
    },

    itemsPrice:    { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    taxPrice:      { type: Number, required: true, default: 0.0 },
    totalPrice:    { type: Number, required: true, default: 0.0 },

    isPaid:     { type: Boolean, default: false },
    paidAt:     Date,

    isDelivered:   { type: Boolean, default: false },
    deliveredAt:   Date,

    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    trackingNumber: String,
  },
  { timestamps: true }
);

// Virtual: discount amount
orderSchema.virtual('discount').get(function () {
  return (this.itemsPrice * 0.0).toFixed(2); // hook in promo logic
});

module.exports = mongoose.model('Order', orderSchema);

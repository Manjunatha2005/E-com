const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true },
    category:     {
      type:   String,
      required: true,
      enum: ['fresh', 'dried', 'medicinal', 'kits'],
    },
    description:  { type: String, required: true },
    images:       [{ type: String }],

    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },

    countInStock: { type: Number, required: true, default: 0, min: 0 },

    rating:     { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews:    [reviewSchema],

    isFeatured:   { type: Boolean, default: false },

    weightOptions:    [{ type: String }],
    origin:           { type: String },
    shelfLife:        { type: String },
    certifications:   [{ type: String }],
  },
  { timestamps: true }
);

// Auto-recompute average rating after a review is saved
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);

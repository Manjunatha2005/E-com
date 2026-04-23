/**
 * config/seeder.js
 * Run:  node config/seeder.js          → seed DB
 * Run:  node config/seeder.js --destroy → clear DB
 */

const mongoose  = require('mongoose');
const dotenv    = require('dotenv');
const Product   = require('../models/Product');
const User      = require('../models/User');

dotenv.config({ path: '../.env' });

const connectDB = require('./db');
connectDB();

const sampleProducts = [
  {
    name: 'Shiitake Premium Pack',
    slug: 'shiitake-premium-pack',
    category: 'fresh',
    description: 'Hand-picked organic shiitake grown on natural oak logs. Rich in umami flavour, B vitamins, zinc, and immune-boosting beta-glucans.',
    images: ['/images/shiitake.jpg'],
    price: 14.99,
    originalPrice: 18.00,
    countInStock: 80,
    rating: 4.5,
    numReviews: 128,
    isFeatured: true,
    weightOptions: ['200g', '500g', '1kg', '2kg'],
    origin: 'ForestRoots Farm, Karnataka',
    shelfLife: '7–10 days refrigerated',
    certifications: ['NPOP Organic'],
  },
  {
    name: 'King Oyster Bundle',
    slug: 'king-oyster-bundle',
    category: 'fresh',
    description: 'Plump, meaty king oyster mushrooms with a firm texture and mild, nutty flavour. Perfect for grilling and pan-searing.',
    images: ['/images/king-oyster.jpg'],
    price: 11.99,
    originalPrice: 15.00,
    countInStock: 60,
    rating: 5,
    numReviews: 94,
    isFeatured: true,
    weightOptions: ['250g', '500g', '1kg'],
    origin: 'Umami Farms, Tamil Nadu',
    shelfLife: '7–12 days refrigerated',
    certifications: ['NPOP Organic'],
  },
  {
    name: 'Portobello Caps (6-pack)',
    slug: 'portobello-caps-6-pack',
    category: 'fresh',
    description: 'Large, flavourful portobello caps — ideal for stuffing, grilling, or using as a meat substitute in burgers.',
    images: ['/images/portobello.jpg'],
    price: 9.49,
    originalPrice: 12.00,
    countInStock: 45,
    rating: 4,
    numReviews: 67,
    isFeatured: false,
    weightOptions: ['6-pack (~400g)', '12-pack (~800g)'],
    origin: 'Spore Valley, Maharashtra',
    shelfLife: '5–7 days refrigerated',
    certifications: ['NPOP Organic'],
  },
  {
    name: "Lion's Mane Whole",
    slug: 'lions-mane-whole',
    category: 'fresh',
    description: "Lion's Mane has a delicate seafood-like taste and is prized for potential neuroprotective properties. Sauté in butter for a stunning dish.",
    images: ['/images/lions-mane.jpg'],
    price: 18.99,
    originalPrice: 24.00,
    countInStock: 35,
    rating: 5,
    numReviews: 203,
    isFeatured: true,
    weightOptions: ['150g', '300g', '500g'],
    origin: 'Wild Earth Co., Himachal Pradesh',
    shelfLife: '5–8 days refrigerated',
    certifications: ['NPOP Organic', 'Vegan Society'],
  },
  {
    name: 'Dried Porcini (100g)',
    slug: 'dried-porcini-100g',
    category: 'dried',
    description: 'Intensely flavoured dried porcini — the secret weapon of Italian cooking. Rehydrate in warm water for broths, risottos, and pasta sauces.',
    images: ['/images/dried-porcini.jpg'],
    price: 19.99,
    originalPrice: 25.00,
    countInStock: 100,
    rating: 4.5,
    numReviews: 76,
    isFeatured: false,
    weightOptions: ['50g', '100g', '250g'],
    origin: 'Imported (Italy / ForestRoots blended)',
    shelfLife: '24 months sealed',
    certifications: ['EU Organic'],
  },
  {
    name: 'Dried Chanterelle Slices',
    slug: 'dried-chanterelle-slices',
    category: 'dried',
    description: 'Golden chanterelle slices with a fruity, apricot-like aroma. Excellent in cream sauces and omelettes.',
    images: ['/images/chanterelle.jpg'],
    price: 22.99,
    originalPrice: 28.00,
    countInStock: 50,
    rating: 4.5,
    numReviews: 41,
    isFeatured: false,
    weightOptions: ['50g', '100g'],
    origin: 'CedarLog Growers, Uttarakhand',
    shelfLife: '18 months sealed',
    certifications: ['NPOP Organic'],
  },
  {
    name: 'Reishi Extract Powder',
    slug: 'reishi-extract-powder',
    category: 'medicinal',
    description: 'Dual-extract reishi powder (hot water + alcohol) standardised to 30% polysaccharides. Known for immune support and stress adaptation.',
    images: ['/images/reishi-powder.jpg'],
    price: 29.99,
    originalPrice: 38.00,
    countInStock: 120,
    rating: 5,
    numReviews: 318,
    isFeatured: true,
    weightOptions: ['60g (30 servings)', '120g (60 servings)'],
    origin: 'MycoHarvest Co., Karnataka',
    shelfLife: '24 months sealed',
    certifications: ['FSSAI', 'NPOP Organic', 'Vegan Society'],
  },
  {
    name: 'Chaga Mushroom Tea',
    slug: 'chaga-mushroom-tea',
    category: 'medicinal',
    description: 'Wild-harvested Siberian chaga in convenient tea bags. Rich in antioxidants and beta-glucans — brew like regular tea for a rich, earthy cup.',
    images: ['/images/chaga-tea.jpg'],
    price: 22.99,
    originalPrice: 28.00,
    countInStock: 75,
    rating: 4,
    numReviews: 52,
    isFeatured: false,
    weightOptions: ['20 bags', '40 bags'],
    origin: 'Wild harvest, Siberia',
    shelfLife: '24 months',
    certifications: ['EU Organic'],
  },
  {
    name: 'Cordyceps Performance Blend',
    slug: 'cordyceps-performance-blend',
    category: 'medicinal',
    description: 'Cs-4 cordyceps cultivated extract blended with lion\'s mane. Popular among athletes for energy and endurance support.',
    images: ['/images/cordyceps.jpg'],
    price: 34.99,
    originalPrice: 42.00,
    countInStock: 90,
    rating: 4.5,
    numReviews: 189,
    isFeatured: false,
    weightOptions: ['60g', '120g', '240g'],
    origin: 'MycoHarvest Co., Karnataka',
    shelfLife: '24 months',
    certifications: ['FSSAI', 'NPOP Organic'],
  },
  {
    name: 'Shiitake Home Grow Kit',
    slug: 'shiitake-home-grow-kit',
    category: 'kits',
    description: 'Everything you need to grow fresh shiitake at home in 2–3 weeks. Includes inoculated oak-log substrate block, humidity tent, misting bottle, and step-by-step guide.',
    images: ['/images/grow-kit.jpg'],
    price: 34.99,
    originalPrice: 45.00,
    countInStock: 40,
    rating: 5,
    numReviews: 147,
    isFeatured: true,
    weightOptions: ['Standard (2kg block)', 'XL (4kg block)'],
    origin: 'MycoMart Lab, Bengaluru',
    shelfLife: 'Use within 2 weeks of delivery',
    certifications: ['NPOP Organic substrate'],
  },
  {
    name: "Oyster Mushroom Grow Kit",
    slug: 'oyster-mushroom-grow-kit',
    category: 'kits',
    description: 'Blue oyster mushroom grow kit for beginners. Produces 2–4 flushes on a straw-based substrate. Yields visible pinning within 7–10 days.',
    images: ['/images/oyster-kit.jpg'],
    price: 27.99,
    originalPrice: 35.00,
    countInStock: 55,
    rating: 4.5,
    numReviews: 88,
    isFeatured: false,
    weightOptions: ['Starter (1.5kg)', 'Pro (3kg)'],
    origin: 'MycoMart Lab, Bengaluru',
    shelfLife: 'Use within 1 week of delivery',
    certifications: ['NPOP Organic substrate'],
  },
  {
    name: 'Enoki Cluster (200g)',
    slug: 'enoki-cluster-200g',
    category: 'fresh',
    description: 'Delicate, thin-stemmed enoki with a mild, slightly fruity flavour. Perfect raw in salads or briefly cooked in Asian broths and hot pot.',
    images: ['/images/enoki.jpg'],
    price: 7.99,
    originalPrice: 10.00,
    countInStock: 70,
    rating: 4.5,
    numReviews: 55,
    isFeatured: false,
    weightOptions: ['200g', '400g'],
    origin: 'Spore Valley, Maharashtra',
    shelfLife: '5–7 days refrigerated',
    certifications: ['NPOP Organic'],
  },
];

const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log('✅  Data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('❌  Seeder error:', err.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Data destroyed!');
    process.exit();
  } catch (err) {
    console.error('❌  Destroy error:', err.message);
    process.exit(1);
  }
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  importData();
}

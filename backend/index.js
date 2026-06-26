const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const prisma = require('./db');
const { verifyToken, verifyAdmin, JWT_SECRET } = require('./middleware/auth');
const { generateComparison } = require('./ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // For production, configure this to match your frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiter to protect endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

// Simple Input Sanitization Middleware
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic HTML tag strip and whitespace trim
        req.body[key] = req.body[key].replace(/<[^>]*>/g, '').trim();
      }
    }
  }
  next();
}
app.use(sanitizeBody);

// Test route / Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'PostgreSQL via Prisma ORM' });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
  }

  try {
    const formattedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // First user becomes admin, others sales_staff
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'admin' : 'sales_staff';

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: formattedEmail,
        password: passwordHash,
        role
      }
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/profile
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Auth profile check error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// COMPARISON ENDPOINTS
// ==========================================

// POST /api/comparison/generate
app.post('/api/comparison/generate', verifyToken, async (req, res) => {
  const {
    competitor_product,
    competitor_brand,
    competitor_features,
    customer_requirements,
    budget,
    intended_usage,
    our_product,
    our_features,
    product_category,
    additional_notes,
    brief_language
  } = req.body;

  if (!competitor_product || !our_product) {
    return res.status(400).json({
      error: 'Competitor Product and Company Product Name are required fields.'
    });
  }

  try {
    const briefContent = await generateComparison({
      competitor_product,
      competitor_brand,
      competitor_features,
      customer_requirements,
      budget,
      intended_usage,
      our_product,
      our_features,
      product_category,
      additional_notes,
      brief_language
    });

    const generatedString = JSON.stringify(briefContent);

    // Save to comparisons table
    const comparison = await prisma.comparison.create({
      data: {
        userId: req.user.id,
        competitorProduct: competitor_product.trim(),
        competitorBrand: competitor_brand ? competitor_brand.trim() : '',
        competitorFeatures: competitor_features ? competitor_features.trim() : '',
        customerRequirements: customer_requirements ? customer_requirements.trim() : '',
        ourProduct: our_product.trim(),
        ourFeatures: our_features ? our_features.trim() : '',
        generatedOutput: generatedString
      }
    });

    res.json({
      id: comparison.id,
      brief: briefContent,
      created_at: comparison.createdAt
    });
  } catch (error) {
    console.error('Comparison generation failed:', error);
    res.status(500).json({ error: 'AI comparison brief generation failed. Please try again.' });
  }
});

// GET /api/comparison/history
app.get('/api/comparison/history', verifyToken, async (req, res) => {
  const { search, rating, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const whereClause = {};

    // If sales staff, filter only their own creations
    if (req.user.role !== 'admin') {
      whereClause.userId = req.user.id;
    }

    // Add search criteria
    if (search) {
      const trimmedSearch = search.trim();
      whereClause.OR = [
        { competitorProduct: { contains: trimmedSearch } },
        { competitorBrand: { contains: trimmedSearch } },
        { ourProduct: { contains: trimmedSearch } }
      ];
    }

    // Add rating criteria
    if (rating) {
      whereClause.rating = parseInt(rating);
    }

    // Query comparisons & count
    const [comparisons, totalCount] = await prisma.$transaction([
      prisma.comparison.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.comparison.count({ where: whereClause })
    ]);

    const formatted = comparisons.map(item => ({
      id: item.id,
      user_id: item.userId,
      staff_name: item.user.name,
      competitor_product: item.competitorProduct,
      competitor_brand: item.competitorBrand,
      competitor_features: item.competitorFeatures,
      customer_requirements: item.customerRequirements,
      our_product: item.ourProduct,
      our_features: item.ourFeatures,
      rating: item.rating,
      created_at: item.createdAt
    }));

    res.json({
      comparisons: formatted,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/comparison/:id
app.get('/api/comparison/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const comparison = await prisma.comparison.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison brief not found.' });
    }

    // Ownership check (Staff only see theirs, Admin sees all)
    if (req.user.role !== 'admin' && comparison.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this brief.' });
    }

    let parsedOutput = {};
    try {
      parsedOutput = JSON.parse(comparison.generatedOutput);
    } catch (e) {
      parsedOutput = { rawText: comparison.generatedOutput };
    }

    res.json({
      id: comparison.id,
      user_id: comparison.userId,
      staff_name: comparison.user.name,
      staff_email: comparison.user.email,
      competitor_product: comparison.competitorProduct,
      competitor_brand: comparison.competitorBrand,
      competitor_features: comparison.competitorFeatures,
      customer_requirements: comparison.customerRequirements,
      our_product: comparison.ourProduct,
      our_features: comparison.ourFeatures,
      response: parsedOutput,
      rating: comparison.rating,
      created_at: comparison.createdAt
    });
  } catch (error) {
    console.error('Error fetching history details:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/comparison/:id
app.delete('/api/comparison/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const comparison = await prisma.comparison.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comparison) {
      return res.status(404).json({ error: 'Brief not found.' });
    }

    if (req.user.role !== 'admin' && comparison.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You cannot delete this brief.' });
    }

    await prisma.comparison.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Comparison report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comparison item:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// FEEDBACK & RATINGS ROUTES
// ==========================================

// POST /api/feedback
app.post('/api/feedback', verifyToken, async (req, res) => {
  const { comparison_id, rating, comment } = req.body;

  if (!comparison_id || !rating) {
    return res.status(400).json({ error: 'Comparison ID and star rating (1-5) are required.' });
  }

  const numericRating = parseInt(rating);
  if (numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const compCheck = await prisma.comparison.findUnique({
      where: { id: parseInt(comparison_id) }
    });

    if (!compCheck) {
      return res.status(404).json({ error: 'Comparison brief not found.' });
    }

    // Save Feedback
    await prisma.feedback.create({
      data: {
        comparisonId: parseInt(comparison_id),
        rating: numericRating,
        comment: comment ? comment.trim() : ''
      }
    });

    // Update Comparison rating to the average of all feedbacks
    const ratingsGroup = await prisma.feedback.aggregate({
      where: { comparisonId: parseInt(comparison_id) },
      _avg: { rating: true }
    });

    const averageRating = Math.round(ratingsGroup._avg.rating || numericRating);

    await prisma.comparison.update({
      where: { id: parseInt(comparison_id) },
      data: { rating: averageRating }
    });

    res.json({ message: 'Feedback stored and brief rating updated.', averageRating });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// TELEMETRY & ANALYTICS ENDPOINTS
// ==========================================

// GET /api/analytics
app.get('/api/analytics', verifyToken, async (req, res) => {
  try {
    const totalGenerations = await prisma.comparison.count();
    const totalUsers = await prisma.user.count();
    
    // Average rating
    const avgRatingRes = await prisma.feedback.aggregate({
      _avg: { rating: true }
    });
    const averageRating = parseFloat(avgRatingRes._avg.rating || 0).toFixed(2);

    // Today's generations count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayGenerations = await prisma.comparison.count({
      where: { createdAt: { gte: todayStart } }
    });

    // Top compared competitor brands/products
    const topCompetitors = await prisma.comparison.groupBy({
      by: ['competitorProduct'],
      _count: { competitorProduct: true },
      orderBy: { _count: { competitorProduct: 'desc' } },
      take: 5
    });

    // Daily activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyGenerations = await prisma.comparison.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });

    // Map daily metrics
    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }
    dailyGenerations.forEach(item => {
      const dateStr = item.createdAt.toISOString().split('T')[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      }
    });
    const dailyChart = Object.keys(dailyMap).map(k => ({ date: k, count: dailyMap[k] })).reverse();

    // Monthly activity
    const monthlyGenerations = await prisma.comparison.findMany({
      select: { createdAt: true }
    });
    const monthlyMap = {};
    monthlyGenerations.forEach(item => {
      const monthStr = item.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyMap[monthStr] = (monthlyMap[monthStr] || 0) + 1;
    });
    const monthlyChart = Object.keys(monthlyMap).map(k => ({ month: k, count: monthlyMap[k] })).sort((a,b) => a.month.localeCompare(b.month));

    res.json({
      stats: {
        totalGenerations,
        totalUsers,
        averageRating: parseFloat(averageRating),
        todayGenerations
      },
      charts: {
        daily: dailyChart,
        monthly: monthlyChart,
        topCompetitor: topCompetitors.map(c => ({ name: c.competitorProduct, count: c._count.competitorProduct }))
      }
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Internal server error compiling dashboard analytics.' });
  }
});

// GET /api/analytics/quality
app.get('/api/analytics/quality', verifyToken, async (req, res) => {
  try {
    // Rating distribution
    const distribution = await prisma.feedback.groupBy({
      by: ['rating'],
      _count: { rating: true }
    });

    const ratingDistribution = [1, 2, 3, 4, 5].map(stars => {
      const matched = distribution.find(d => d.rating === stars);
      return {
        stars: `${stars} Star`,
        count: matched ? matched._count.rating : 0
      };
    });

    // Recent comments
    const recentFeedbacks = await prisma.feedback.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        comparison: {
          select: {
            competitorProduct: true,
            ourProduct: true,
            user: { select: { name: true } }
          }
        }
      }
    });

    const formattedComments = recentFeedbacks.map(f => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      created_at: f.createdAt,
      staff_name: f.comparison.user.name,
      comparison: `${f.comparison.ourProduct} vs ${f.comparison.competitorProduct}`
    }));

    res.json({
      distribution: ratingDistribution,
      comments: formattedComments
    });
  } catch (error) {
    console.error('Error fetching quality analytics:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/analytics/trends
app.get('/api/analytics/trends', verifyToken, async (req, res) => {
  try {
    // Top compared competitor brands
    const topBrands = await prisma.comparison.groupBy({
      by: ['competitorBrand'],
      _count: { competitorBrand: true },
      orderBy: { _count: { competitorBrand: 'desc' } },
      take: 5
    });

    // Top compared company products
    const topOurProducts = await prisma.comparison.groupBy({
      by: ['ourProduct'],
      _count: { ourProduct: true },
      orderBy: { _count: { ourProduct: 'desc' } },
      take: 5
    });

    res.json({
      competitorBrands: topBrands.map(b => ({ name: b.competitorBrand || 'Unknown', count: b._count.competitorBrand })),
      companyProducts: topOurProducts.map(p => ({ name: p.ourProduct, count: p._count.ourProduct }))
    });
  } catch (error) {
    console.error('Error fetching trend analytics:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/admin/users
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/users
app.post('/api/admin/users', verifyAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
  }

  try {
    const formattedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: formattedEmail } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: formattedEmail,
        password: passwordHash,
        role
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const userId = parseInt(id);
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own administrative account.' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// PRODUCT CATALOG CATALOG ENDPOINTS
// ==========================================

// GET /api/products
app.get('/api/products', verifyToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/products (Admin Only)
app.post('/api/products', verifyAdmin, async (req, res) => {
  const { name, category, features } = req.body;

  if (!name || !category || !features) {
    return res.status(400).json({ error: 'Name, category, and features are required.' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        features: features.trim()
      }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/products/:id (Admin Only)
app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// TEMPLATE PRESETS ENDPOINTS
// ==========================================

// GET /api/templates
app.get('/api/templates', verifyToken, async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Map database properties to preset_data JSON format expected by frontend
    const mapped = templates.map(t => ({
      id: t.id,
      name: t.name,
      preset_data: {
        competitor_product: t.competitorProduct,
        competitor_brand: t.competitorBrand,
        competitor_features: t.competitorFeatures,
        customer_requirements: t.customerRequirements,
        our_product: t.ourProduct,
        our_features: t.ourFeatures,
        additional_notes: t.additionalNotes
      }
    }));
    
    res.json(mapped);
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/templates (Authenticated Users)
app.post('/api/templates', verifyToken, async (req, res) => {
  const {
    name,
    competitor_product,
    competitor_brand,
    competitor_features,
    customer_requirements,
    our_product,
    our_features,
    additional_notes
  } = req.body;

  if (!name || !competitor_product || !our_product) {
    return res.status(400).json({ error: 'Template name, competitor product, and our product name are required.' });
  }

  try {
    const template = await prisma.template.create({
      data: {
        name: name.trim(),
        competitorProduct: competitor_product.trim(),
        competitorBrand: competitor_brand ? competitor_brand.trim() : '',
        competitorFeatures: competitor_features ? competitor_features.trim() : '',
        customerRequirements: customer_requirements ? customer_requirements.trim() : '',
        ourProduct: our_product.trim(),
        ourFeatures: our_features ? our_features.trim() : '',
        additionalNotes: additional_notes ? additional_notes.trim() : ''
      }
    });

    res.status(201).json({
      id: template.id,
      name: template.name,
      preset_data: {
        competitor_product: template.competitorProduct,
        competitor_brand: template.competitorBrand,
        competitor_features: template.competitorFeatures,
        customer_requirements: template.customerRequirements,
        our_product: template.ourProduct,
        our_features: template.ourFeatures,
        additional_notes: template.additionalNotes
      }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/templates/:id (Admin Only)
app.delete('/api/templates/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.template.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Template deleted successfully.' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// AI PROMPT CONFIGURATION ENDPOINTS
// ==========================================

// GET /api/prompts (Admin Only)
app.get('/api/prompts', verifyAdmin, async (req, res) => {
  try {
    const prompts = await prisma.aIPrompt.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/prompts (Admin Only)
app.post('/api/prompts', verifyAdmin, async (req, res) => {
  const { name, system_prompt, is_active } = req.body;

  if (!name || !system_prompt) {
    return res.status(400).json({ error: 'Prompt Name and System Prompt Text are required.' });
  }

  try {
    // If setting active, deactivate others first
    if (is_active) {
      await prisma.aIPrompt.updateMany({
        data: { isActive: false }
      });
    }

    const newPrompt = await prisma.aIPrompt.create({
      data: {
        name: name.trim(),
        systemPrompt: system_prompt.trim(),
        isActive: !!is_active
      }
    });

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating AI prompt:', error);
    res.status(500).json({ error: 'Internal server error or prompt name already exists.' });
  }
});

// PUT /api/prompts/:id (Admin Only - Toggle Active or Edit)
app.put('/api/prompts/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { system_prompt, is_active } = req.body;

  try {
    const promptId = parseInt(id);

    // If activating this one, deactivate all others
    if (is_active) {
      await prisma.aIPrompt.updateMany({
        where: { id: { not: promptId } },
        data: { isActive: false }
      });
    }

    const updated = await prisma.aIPrompt.update({
      where: { id: promptId },
      data: {
        ...(system_prompt && { systemPrompt: system_prompt.trim() }),
        ...(is_active !== undefined && { isActive: !!is_active })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating prompt configuration:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/prompts/:id (Admin Only)
app.delete('/api/prompts/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.aIPrompt.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'AI Prompt configuration deleted successfully.' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// INITIALIZATION AND STARTUP
// ==========================================

async function ensureDefaultTemplates() {
  const defaultTemplates = [
    {
      name: 'Outdoor Smartwatch Comparison',
      competitorProduct: 'Apple Watch Series 9',
      competitorBrand: 'Apple',
      competitorFeatures: '18-hour battery life, Always-On Retina OLED screen, sleek lifestyle design, extensive smart app ecosystem, aluminum casing, standard GPS navigation.',
      customerRequirements: 'wants long battery life (over a week) for hiking and rugged outdoor durability, but is attracted to Apple\'s smart features.',
      ourProduct: 'Garmin Fenix 7',
      ourFeatures: 'Up to 18 days battery life in smartwatch mode, solar charging options, rugged titanium bezel, preloaded TopoActive maps, robust offline navigation, extensive sports telemetry, water-resistant 10 ATM.',
      additionalNotes: 'Garmin handles weeks of camping whereas Apple requires daily charging, making it impractical for trails.'
    },
    {
      name: 'Noise Cancelling Audio Comparison',
      competitorProduct: 'QuietComfort Ultra',
      competitorBrand: 'Bose',
      competitorFeatures: 'Excellent custom ANC, immersive audio mode, folding design, premium Bose sound signature, 24-hour battery life.',
      customerRequirements: 'wants top-tier active noise cancellation and clear call quality for work calls, but is undecided on comfort and smart features.',
      ourProduct: 'Sony WH-1000XM5',
      ourFeatures: 'Industry-leading dual-processor ANC, 30-hour battery life, Speak-to-Chat smart pause, multipoint Bluetooth connection, outstanding 8-mic call arrays, lightweight premium design.',
      additionalNotes: 'XM5 has longer battery life (30h vs 24h) and advanced smart features like speak-to-chat.'
    },
    {
      name: 'Smart Vacuum Mop Comparison',
      competitorProduct: 'Roomba Combo j9+',
      competitorBrand: 'iRobot',
      competitorFeatures: 'Premium auto-retract mop, obstacle avoidance, automatic dirt disposal, proprietary clean base, high brand recognition, pricing around $1399.',
      customerRequirements: 'wants a reliable hands-free cleaning device that vacuums and mops, but wants to avoid constant maintenance and high pricing.',
      ourProduct: 'Roborock Q Revo',
      ourFeatures: 'Dual spinning mops with automatic lifting, 5500Pa suction power, multifunctional dock that washes/dries mop pads with warm air and empties dust, LiDAR navigation, highly competitive price.',
      additionalNotes: 'Q Revo offers hot air mop drying and spinning mops at a much lower price ($899 vs $1399).'
    },
    {
      name: 'Premium Coffee Maker Comparison',
      competitorProduct: 'La Specialista Prestigio',
      competitorBrand: 'DeLonghi',
      competitorFeatures: 'Sensor grinding technology, smart tamping station, active temperature control, professional steam wand, high-end stainless steel design.',
      customerRequirements: 'wants an authentic cafe-quality espresso experience at home with built-in grinding, without complex manual setup.',
      ourProduct: 'Breville Barista Express',
      ourFeatures: 'Integrated conical burr grinder (16 grind settings), digital temperature control (PID) for perfect extraction, manual microfoam milk texturing, dedicated hot water outlet, 15-bar Italian pump.',
      additionalNotes: 'Breville is the industry gold standard and provides far superior microfoam milk texturing for latte art.'
    }
  ];

  const defaultProducts = [
    {
      name: 'Garmin Fenix 7',
      category: 'Wearables',
      features: 'Up to 18 days battery life in smartwatch mode, solar charging options, rugged titanium bezel, preloaded TopoActive maps, robust offline navigation, extensive sports telemetry, water-resistant 10 ATM.'
    },
    {
      name: 'Sony WH-1000XM5',
      category: 'Audio',
      features: 'Industry-leading dual-processor ANC, 30-hour battery life, Speak-to-Chat smart pause, multipoint Bluetooth connection, outstanding 8-mic call arrays, lightweight premium design.'
    },
    {
      name: 'Roborock Q Revo',
      category: 'Smart Home',
      features: 'Dual spinning mops with automatic lifting, 5500Pa suction power, multifunctional dock that washes/dries mop pads with warm air and empties dust, LiDAR navigation, highly competitive price.'
    },
    {
      name: 'Breville Barista Express',
      category: 'Kitchen Appliances',
      features: 'Integrated conical burr grinder (16 grind settings), digital temperature control (PID) for perfect extraction, manual microfoam milk texturing, dedicated hot water outlet, 15-bar Italian pump.'
    }
  ];

  for (const prod of defaultProducts) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (!existing) {
      await prisma.product.create({ data: prod });
      console.log(`Auto-seeded product: ${prod.name}`);
    }
  }

  for (const temp of defaultTemplates) {
    const existing = await prisma.template.findUnique({ where: { name: temp.name } });
    if (!existing) {
      await prisma.template.create({ data: temp });
      console.log(`Auto-seeded template: ${temp.name}`);
    }
  }
}

// Start Express Server
app.listen(PORT, async () => {
  console.log(`Server is running securely on port ${PORT}`);
  try {
    await ensureDefaultTemplates();
    console.log('Auto-seed check completed successfully.');
  } catch (err) {
    console.error('Error during startup auto-seeding:', err);
  }
});
// Nodemon reload trigger after resolving port 5005 conflict

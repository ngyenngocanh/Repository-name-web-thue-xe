const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
// Server restart trigger: 2026-05-14 18:44:00
require('dotenv').config({ override: true });

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const driverRoutes = require('./routes/driver');
const addressRoutes = require('./routes/addresses');
const tripRoutes = require('./routes/trips');
const contractRoutes = require('./routes/contracts');
const tripSettingsRoutes = require('./routes/tripSettings');
const collaboratorRoutes = require('./routes/collaborator');
const chatRoutes = require('./routes/chat');
const vnpayRoutes = require('./routes/vnpay');
// const momoRoutes = require('./routes/momo');
const vietqrRoutes = require('./routes/vietqr');
const notificationRoutes = require('./routes/notifications');
const payoutRoutes = require('./routes/payouts');
const payosRoutes = require('./routes/payos');
const app = express();

const driverScheduleRoutes = require('./routes/driverSchedule');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (tăng lên cho development + notification polling)
  standardHeaders: true,
  legacyHeaders: false,
  // Bỏ qua rate limit cho các route static và health check
  skip: (req) => req.path === '/api/health' || req.path.startsWith('/uploads')
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Make multer available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MSSQL pool pre-warm: initialize connection pool eagerly so first requests are fast
const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
if (dbProvider === 'mssql') {
  const { getSqlPool } = require('./db/sqlServer');
  getSqlPool()
    .then(pool => {
      // Run a lightweight ping to confirm connectivity
      return pool.request().query('SELECT 1 AS ping');
    })
    .then(() => console.log('MSSQL pool initialized and ready'))
    .catch(err => console.error('MSSQL pool init error:', err.message));
}

const passport = require('passport');
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/trip-settings', tripSettingsRoutes);
app.use('/api/collaborator', collaboratorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vnpay', vnpayRoutes);
// app.use('/api/momo', momoRoutes);
app.use('/api/vietqr', vietqrRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/payos', payosRoutes);
// Health check endpoint
app.use('/api/driver', driverScheduleRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const BASE_PORT = Number(process.env.PORT) || 5000;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

startServer(BASE_PORT);

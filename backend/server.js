require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

//routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const app = express();

// Use cors middleware
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://192.168.100.97:5173', 
        'http://192.168.100.120:5173',
        'http://192.168.1.191:5173',
        'http://192.168.1.192:5173'
    ], // Allow requests from your client's origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// Security middleware
app.use(helmet());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/auth', limiter);

app.use('/api/auth', authRoutes);
app.use("/users", testRoutes)


app.get('/api/health', (req, res) => {
    console.log(req.hostname)
    res.json({
        success: true,
        message: 'Server is running from backend now',
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5177;

app.listen(PORT, (err) => {
    if (err) {
        console.error('Server failed to start:', err.message);
        return process.exit(1);
    }
    console.log(`Server is running on port ${PORT}`);
    // console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
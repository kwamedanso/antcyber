require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const app = express();

// Use cors middleware
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your client's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    console.log(req.hostname)
    res.json({
        success: true,
        message: 'Server is running from backend now',
        timestamp: new Date().toISOString(),
    });
});


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
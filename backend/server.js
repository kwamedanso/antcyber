require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');


const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [''] // Replace with your actual production domain or leave empty if solely using Nginx reverse proxy
    : [
        'http://localhost:5173', 
        'http://192.168.100.97:5173', 
        'http://192.168.100.120:5173',
        'http://192.168.1.191:5173',
        'http://192.168.1.192:5173'
      ];

//routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/tasks');
const testRoutes = require('./routes/test');
const app = express();

app.use(cookieParser());

// Use cors middleware
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'))
app.use('/public', express.static(path.join(__dirname, 'public')));




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
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/reports", require('./routes/report'))
app.use('/api/rbac', require('./routes/rbac'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/notifications', require('./routes/notification'));



// app.use("/users", testRoutes)


// app.get('/api/health', (req, res) => {
//     console.log(req.hostname)
//     res.json({
//         success: true,
//         message: 'Server is running from backend now',
//         timestamp: new Date().toISOString(),
//         port: PORT
//     });
// });

// Error handling middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5178;

app.listen(PORT, (err) => {
    if (err) {
        console.error('Server failed to start:', err.message);
        return process.exit(1);
    }
    console.log(`Server is running on port ${PORT}`);
    // console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
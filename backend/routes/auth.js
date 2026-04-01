const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');


const login = require("../controllers/auth/login")
const refreshToken = require("../controllers/auth/refreshToken")
const logout = require("../controllers/auth/logout")
const register = require("../controllers/auth/register")

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes

// router.get('/users', authenticateToken, testUser)

router.get('/refresh', refreshToken);
router.get('/logout', logout);


module.exports = router;
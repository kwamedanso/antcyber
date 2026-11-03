const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { setupSuperAdmin } = require('../controllers/auth/setup');


const {login} = require("../controllers/auth/login")
const {refresh} = require("../controllers/auth/refreshToken")
const { getUserProfile } = require('../controllers/auth/getUserProfile.js');

const {logout} = require("../controllers/auth/logout")
// const register = require("../controllers/auth/register")

// Public routes
router.post('/login', login);
// router.post('/register', register);

// Protected routes

// router.get('/users', authenticateToken, testUser)

router.post('/refresh', refresh);
router.get('/me', authenticateToken, getUserProfile);

router.post('/logout', logout);

router.post('/super-admin', setupSuperAdmin);


// router.get('/logout', logout);


module.exports = router;
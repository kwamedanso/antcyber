const express = require("express");
const router = express.Router();
const {authenticateToken, requireRole} = require("../middleware/auth");

const fetchUsers = require("../controllers/test/fetchUsers");

// router.get("/", authenticateToken, requireRole("admin"), fetchUsers)
// requireRole("role") receives the user object with the users role from the authenticateToken middleware.
router.get("/", authenticateToken, fetchUsers);

module.exports = router;
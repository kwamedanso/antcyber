const express = require('express');
const router = express.Router();

const {setupSuperAdmin} = require("../controllers/auth/setup");


router.post("/super-admin", setupSuperAdmin);

module.exports = router;
const express = require('express');
const { getMyBusinessConfig, listBusinessTypes } = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Authenticated: get config for current shop's business type
router.get('/business-type', authMiddleware, getMyBusinessConfig);

// Public: list all business types (for admin/registration dropdowns)
router.get('/business-types', listBusinessTypes);

module.exports = router;

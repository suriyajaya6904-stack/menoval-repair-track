const express = require('express');
const router = express.Router();
const { getJobTracking } = require('../controllers/trackingController');

// Public route — no auth middleware
router.get('/:jobId', getJobTracking);

module.exports = router;

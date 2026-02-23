const express = require('express');
const router = express.Router();
const { getPublicStats, getSingleVendor } = require('../controllers/publicController');

router.get('/stats', getPublicStats);
router.get('/vendors/:vendorId', getSingleVendor);

module.exports = router;

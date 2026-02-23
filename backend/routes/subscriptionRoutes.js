const express = require('express');
const router = express.Router();
const { subscribeToPlan, getMySubscriptions, getAllSubscriptions } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('VENDOR'), subscribeToPlan);
router.get('/my', protect, authorize('VENDOR'), getMySubscriptions);
router.get('/', protect, authorize('ADMIN'), getAllSubscriptions);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan, deletePlan } = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getPlans);
router.post('/', protect, authorize('ADMIN'), createPlan);
router.put('/:id', protect, authorize('ADMIN'), updatePlan);
router.delete('/:id', protect, authorize('ADMIN'), deletePlan);

module.exports = router;

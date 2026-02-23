const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
const getPlans = async (req, res, next) => {
    try {
        const plans = await Plan.find();
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res, next) => {
    try {
        console.log('Backend: Creating plan with body:', req.body);
        const plan = await Plan.create(req.body);
        console.log('Backend: Plan created successfully:', plan._id);
        res.status(201).json(plan);
    } catch (error) {
        console.error('Backend: Plan creation error:', error);
        next(error);
    }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res, next) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a plan (soft delete/toggle active)
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res, next) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        
        plan.isActive = !plan.isActive;
        await plan.save();
        
        res.json({ message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan
};

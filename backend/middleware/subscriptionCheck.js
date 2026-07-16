const User = require('../models/User');

module.exports = (requiredPlan) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            
            if (!user.subscription.isActive) {
                return res.status(403).json({ 
                    message: 'Subscription required',
                    requiredPlan 
                });
            }
            
            const planHierarchy = ['free', 'premium', 'pro'];
            const userPlanIndex = planHierarchy.indexOf(user.subscription.type);
            const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
            
            if (userPlanIndex < requiredPlanIndex) {
                return res.status(403).json({ 
                    message: `This feature requires ${requiredPlan} subscription`,
                    currentPlan: user.subscription.type,
                    requiredPlan 
                });
            }
            
            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};
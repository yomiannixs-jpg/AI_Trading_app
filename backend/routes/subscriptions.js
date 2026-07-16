const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get subscription plans
router.get('/plans', (req, res) => {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            duration: '30 days trial',
            features: [
                'Basic market data',
                'Limited predictions (5/day)',
                'Watchlist (up to 5 items)',
                'Basic charts'
            ]
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 5000,
            duration: 'Monthly',
            features: [
                'Advanced market data',
                'Unlimited predictions',
                'Real-time alerts',
                'Portfolio tracking',
                'Advanced charts with indicators',
                'Priority support',
                'Social trading features'
            ]
        },
        {
            id: 'pro',
            name: 'Professional',
            price: 15000,
            duration: 'Monthly',
            features: [
                'All Premium features',
                'API access',
                'Custom indicators',
                'Backtesting',
                'Dedicated account manager',
                'Copy trading',
                'Advanced analytics',
                'Priority execution'
            ]
        }
    ];
    
    res.json(plans);
});

// Subscribe to a plan
router.post('/subscribe', auth, async (req, res) => {
    try {
        const { planId, duration = 1 } = req.body;
        const user = await User.findById(req.userId);
        
        const plans = {
            premium: 5000,
            pro: 15000
        };
        
        if (!plans[planId]) {
            return res.status(400).json({ message: 'Invalid plan' });
        }
        
        const price = plans[planId] * duration;
        
        // In production, integrate with payment gateway (Paystack, Flutterwave)
        // For now, simulate payment
        
        user.subscription = {
            type: planId,
            startDate: new Date(),
            endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            autoRenew: false
        };
        
        await user.save();
        
        res.json({
            message: 'Subscription successful',
            subscription: user.subscription
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        user.subscription.isActive = false;
        user.subscription.endDate = new Date();
        user.subscription.autoRenew = false;
        
        await user.save();
        
        res.json({ message: 'Subscription cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current subscription
router.get('/current', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user.subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle auto-renew
router.post('/auto-renew', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.subscription.autoRenew = !user.subscription.autoRenew;
        await user.save();
        
        res.json({
            autoRenew: user.subscription.autoRenew,
            message: `Auto-renewal ${user.subscription.autoRenew ? 'enabled' : 'disabled'}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
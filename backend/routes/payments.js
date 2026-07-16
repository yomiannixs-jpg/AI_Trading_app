const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
    try {
        const { planId, duration, paymentMethod } = req.body;
        
        const plans = {
            premium: { price: 5000, name: 'Premium' },
            pro: { price: 15000, name: 'Professional' }
        };

        if (!plans[planId]) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const amount = plans[planId].price * (duration || 1) * 100; // Convert to kobo
        
        // In production, integrate with Paystack/Flutterwave
        // For now, simulate payment reference
        const reference = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        res.json({
            reference,
            amount,
            currency: 'NGN',
            planName: plans[planId].name,
            duration: duration || 1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
    try {
        const { reference, planId, duration } = req.body;
        
        // In production, verify with payment gateway
        // For now, simulate successful payment
        
        const user = await User.findById(req.userId);
        
        user.subscription = {
            type: planId,
            startDate: new Date(),
            endDate: new Date(Date.now() + (duration || 1) * 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            autoRenew: false
        };
        
        await user.save();
        
        res.json({
            message: 'Payment verified and subscription activated',
            subscription: user.subscription
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
    try {
        // In production, fetch from database
        const payments = [
            {
                id: 'PAY001',
                amount: 5000,
                plan: 'Premium',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                status: 'success',
                reference: 'TXN_123456'
            }
        ];
        
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
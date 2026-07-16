import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Subscription = () => {
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loading, setLoading] = useState(false);

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            features: [
                'Basic market data',
                'Limited predictions (5/day)',
                'Watchlist (up to 5 items)',
                'Basic charts',
                'Community access'
            ],
            color: '#6c757d',
            icon: 'fa-rocket'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: billingCycle === 'monthly' ? 5000 : 50000,
            popular: true,
            features: [
                'Advanced market data',
                'Unlimited predictions',
                'Real-time alerts',
                'Portfolio tracking',
                'Advanced charts with indicators',
                'Priority support',
                'Social trading features',
                'Custom watchlists'
            ],
            color: '#2196F3',
            icon: 'fa-crown'
        },
        {
            id: 'pro',
            name: 'Professional',
            price: billingCycle === 'monthly' ? 15000 : 150000,
            features: [
                'All Premium features',
                'API access',
                'Custom indicators',
                'Backtesting',
                'Dedicated account manager',
                'Copy trading',
                'Advanced analytics',
                'Priority execution'
            ],
            color: '#9C27B0',
            icon: 'fa-gem'
        }
    ];

    const handleSubscribe = async (planId) => {
        setLoading(true);
        try {
            // Initialize payment
            const response = await axios.post('/api/payments/initialize', {
                planId,
                duration: billingCycle === 'monthly' ? 1 : 12,
                paymentMethod: 'paystack'
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // In production, redirect to Paystack/Flutterwave payment page
            // For now, simulate successful payment
            setTimeout(async () => {
                await axios.post('/api/payments/verify', {
                    reference: response.data.reference,
                    planId,
                    duration: billingCycle === 'monthly' ? 1 : 12
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                
                alert('Subscription activated successfully!');
                window.location.reload();
            }, 2000);

        } catch (error) {
            alert('Payment failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="subscription-page">
            <div className="page-header">
                <h1>Choose Your Plan</h1>
                <p>Upgrade your trading experience with premium features</p>
                
                <div className="billing-toggle">
                    <button 
                        className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button 
                        className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Yearly
                        <span className="save-badge">Save 17%</span>
                    </button>
                </div>
            </div>

            <div className="plans-grid">
                {plans.map(plan => (
                    <div 
                        key={plan.id} 
                        className={`plan-card ${plan.popular ? 'popular' : ''} ${
                            user?.subscription?.type === plan.id ? 'current' : ''
                        }`}
                        style={{ borderColor: plan.color }}
                    >
                        {plan.popular && <div className="popular-badge">Most Popular</div>}
                        {user?.subscription?.type === plan.id && (
                            <div className="current-badge">Current Plan</div>
                        )}
                        
                        <div className="plan-header">
                            <i className={`fas ${plan.icon}`} style={{ color: plan.color }}></i>
                            <h3>{plan.name}</h3>
                            <div className="plan-price">
                                <span className="currency">₦</span>
                                <span className="amount">{plan.price.toLocaleString()}</span>
                                <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                        </div>

                        <div className="plan-features">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <i className="fas fa-check"></i>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            className={`btn btn-block ${
                                user?.subscription?.type === plan.id 
                                    ? 'btn-outline' 
                                    : 'btn-primary'
                            }`}
                            style={plan.color ? { 
                                backgroundColor: user?.subscription?.type === plan.id ? 'transparent' : plan.color,
                                borderColor: plan.color,
                                color: user?.subscription?.type === plan.id ? plan.color : 'white'
                            } : {}}
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={loading || user?.subscription?.type === plan.id}
                        >
                            {user?.subscription?.type === plan.id 
                                ? 'Current Plan' 
                                : loading ? 'Processing...' : 'Subscribe Now'
                            }
                        </button>
                    </div>
                ))}
            </div>

            <div className="comparison-table card">
                <h3>Plan Comparison</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Free</th>
                            <th>Premium</th>
                            <th>Professional</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Market Data', 'Basic', 'Advanced', 'Full Access'],
                            ['AI Predictions', '5/day', 'Unlimited', 'Unlimited'],
                            ['Real-time Alerts', '✗', '✓', '✓'],
                            ['Technical Indicators', 'Basic', 'Advanced', 'Custom'],
                            ['Social Trading', 'View Only', 'Full Access', 'Full Access'],
                            ['Copy Trading', '✗', '✗', '✓'],
                            ['API Access', '✗', '✗', '✓'],
                            ['Backtesting', '✗', '✗', '✓'],
                            ['Support', 'Community', 'Priority', 'Dedicated Manager'],
                            ['Custom Indicators', '✗', '✗', '✓']
                        ].map((row, index) => (
                            <tr key={index}>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                                <td className="premium-column">{row[2]}</td>
                                <td className="pro-column">{row[3]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-grid">
                    {[
                        {
                            q: 'Can I switch plans anytime?',
                            a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.'
                        },
                        {
                            q: 'Is there a free trial?',
                            a: 'Yes, all new users get a 30-day free trial of our Free plan. You can upgrade to Premium or Professional at any time.'
                        },
                        {
                            q: 'How accurate are the AI predictions?',
                            a: 'Our AI models achieve approximately 75-85% accuracy on average. However, trading involves risk and past performance doesn\'t guarantee future results.'
                        },
                        {
                            q: 'What payment methods are accepted?',
                            a: 'We accept payments via Paystack, Flutterwave, bank transfer, and debit/credit cards.'
                        },
                        {
                            q: 'Can I cancel my subscription?',
                            a: 'Yes, you can cancel anytime. You\'ll continue to have access until the end of your billing period.'
                        },
                        {
                            q: 'Is my data secure?',
                            a: 'Yes, we use bank-level encryption and security measures to protect your data and funds.'
                        }
                    ].map((faq, index) => (
                        <div key={index} className="faq-item">
                            <h4>{faq.q}</h4>
                            <p>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Subscription;
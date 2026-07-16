const mongoose = require('mongoose');
const SocialPost = require('../models/SocialPost');
const TraderProfile = require('../models/TraderProfile');
const CopyTrade = require('../models/CopyTrade');

class SocialTradingService {
    async createPost(userId, postData) {
        try {
            const post = new SocialPost({
                userId,
                ...postData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await post.save();
            return await post.populate('userId', 'firstName lastName subscription').execPopulate();
        } catch (error) {
            throw new Error(`Error creating post: ${error.message}`);
        }
    }

    async getFeed(userId, options = {}) {
        try {
            const { page = 1, limit = 20, filter = 'all', sort = 'latest' } = options;
            
            let query = {};
            
            switch (filter) {
                case 'following':
                    const profile = await TraderProfile.findOne({ userId });
                    if (profile) {
                        query.userId = { $in: profile.following };
                    }
                    break;
                case 'stocks':
                    query.tradeType = 'stock';
                    break;
                case 'forex':
                    query.tradeType = 'forex';
                    break;
            }

            const sortOptions = {
                latest: { createdAt: -1 },
                popular: { likes: -1 },
                trending: { likes: -1, comments: -1 }
            };

            const posts = await SocialPost.find(query)
                .populate('userId', 'firstName lastName subscription')
                .populate('comments.userId', 'firstName lastName')
                .sort(sortOptions[sort] || { createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return posts;
        } catch (error) {
            throw new Error(`Error fetching feed: ${error.message}`);
        }
    }

    async likePost(postId, userId) {
        try {
            const post = await SocialPost.findById(postId);
            if (!post) throw new Error('Post not found');

            const likeIndex = post.likes.indexOf(userId);
            if (likeIndex === -1) {
                post.likes.push(userId);
            } else {
                post.likes.splice(likeIndex, 1);
            }

            post.updatedAt = new Date();
            await post.save();
            return post;
        } catch (error) {
            throw new Error(`Error liking post: ${error.message}`);
        }
    }

    async commentOnPost(postId, userId, content) {
        try {
            const post = await SocialPost.findById(postId);
            if (!post) throw new Error('Post not found');

            post.comments.push({
                userId,
                content,
                createdAt: new Date()
            });

            post.updatedAt = new Date();
            await post.save();
            return await post.populate('comments.userId', 'firstName lastName').execPopulate();
        } catch (error) {
            throw new Error(`Error commenting: ${error.message}`);
        }
    }

    async createTraderProfile(userId, profileData) {
        try {
            let profile = await TraderProfile.findOne({ userId });
            
            if (profile) {
                Object.assign(profile, profileData, { updatedAt: new Date() });
            } else {
                profile = new TraderProfile({
                    userId,
                    ...profileData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            
            await profile.save();
            return profile;
        } catch (error) {
            throw new Error(`Error creating trader profile: ${error.message}`);
        }
    }

    async followTrader(userId, traderId) {
        try {
            const [userProfile, traderProfile] = await Promise.all([
                TraderProfile.findOne({ userId }),
                TraderProfile.findOne({ userId: traderId })
            ]);

            if (!traderProfile) throw new Error('Trader not found');

            if (!userProfile) {
                await this.createTraderProfile(userId, { following: [traderId] });
            } else {
                if (!userProfile.following.includes(traderId)) {
                    userProfile.following.push(traderId);
                    await userProfile.save();
                }
            }

            if (!traderProfile.followers.includes(userId)) {
                traderProfile.followers.push(userId);
                await traderProfile.save();
            }

            return { message: 'Successfully followed trader' };
        } catch (error) {
            throw new Error(`Error following trader: ${error.message}`);
        }
    }

    async unfollowTrader(userId, traderId) {
        try {
            const [userProfile, traderProfile] = await Promise.all([
                TraderProfile.findOne({ userId }),
                TraderProfile.findOne({ userId: traderId })
            ]);

            if (userProfile) {
                userProfile.following = userProfile.following.filter(
                    id => id.toString() !== traderId.toString()
                );
                await userProfile.save();
            }

            if (traderProfile) {
                traderProfile.followers = traderProfile.followers.filter(
                    id => id.toString() !== userId.toString()
                );
                await traderProfile.save();
            }

            return { message: 'Successfully unfollowed trader' };
        } catch (error) {
            throw new Error(`Error unfollowing trader: ${error.message}`);
        }
    }

    async setupCopyTrade(followerId, traderId, settings) {
        try {
            let copyTrade = await CopyTrade.findOne({ followerId, traderId });
            
            if (copyTrade) {
                Object.assign(copyTrade, settings);
            } else {
                copyTrade = new CopyTrade({
                    followerId,
                    traderId,
                    ...settings
                });
            }
            
            await copyTrade.save();
            return copyTrade;
        } catch (error) {
            throw new Error(`Error setting up copy trade: ${error.message}`);
        }
    }

    async getTopTraders(limit = 10) {
        try {
            const traders = await TraderProfile.find({})
                .populate('userId', 'firstName lastName email')
                .sort({ 'performance.monthly': -1, followers: -1 })
                .limit(limit)
                .lean();

            return traders.map(trader => ({
                ...trader,
                riskLevel: this.calculateRiskLevel(trader.risk),
                performance: this.calculatePerformanceMetrics(trader)
            }));
        } catch (error) {
            throw new Error(`Error fetching top traders: ${error.message}`);
        }
    }

    calculateRiskLevel(risk) {
        if (risk <= 3) return 'Low';
        if (risk <= 6) return 'Medium';
        return 'High';
    }

    calculatePerformanceMetrics(profile) {
        const winRate = profile.winRate || 0;
        return {
            rating: winRate >= 70 ? 'A' : winRate >= 50 ? 'B' : 'C',
            consistency: Math.min(100, winRate * 1.2),
            sharpeRatio: this.calculateSharpeRatio(profile)
        };
    }

    calculateSharpeRatio(profile) {
        const riskFreeRate = 0.02;
        const excessReturn = (profile.totalReturn / 100) - riskFreeRate;
        const volatility = profile.risk / 10;
        return volatility > 0 ? excessReturn / volatility : 0;
    }

    async getSentimentAnalysis(symbol) {
        try {
            const posts = await SocialPost.find({ symbol }).lean();
            
            const sentiments = posts.map(p => p.sentiment);
            const bullish = sentiments.filter(s => s === 'bullish').length;
            const bearish = sentiments.filter(s => s === 'bearish').length;
            const neutral = sentiments.filter(s => s === 'neutral').length;
            const total = sentiments.length || 1;

            return {
                symbol,
                bullishPercentage: (bullish / total) * 100,
                bearishPercentage: (bearish / total) * 100,
                neutralPercentage: (neutral / total) * 100,
                overallSentiment: bullish > bearish ? 'bullish' : 'bearish',
                postCount: total
            };
        } catch (error) {
            throw new Error(`Error analyzing sentiment: ${error.message}`);
        }
    }

    async updateTraderPerformance(userId, tradeResult) {
        try {
            const profile = await TraderProfile.findOne({ userId });
            if (!profile) return;

            profile.totalTrades += 1;
            if (tradeResult.profit > 0) {
                profile.successfulTrades += 1;
            }
            
            profile.winRate = (profile.successfulTrades / profile.totalTrades) * 100;
            profile.totalReturn += tradeResult.returnPercent || 0;
            
            // Update performance periods
            profile.performance.daily += tradeResult.profit || 0;
            profile.performance.weekly += tradeResult.profit || 0;
            profile.performance.monthly += tradeResult.profit || 0;
            profile.performance.yearly += tradeResult.profit || 0;

            await profile.save();
            return profile;
        } catch (error) {
            throw new Error(`Error updating trader performance: ${error.message}`);
        }
    }
}

module.exports = new SocialTradingService();
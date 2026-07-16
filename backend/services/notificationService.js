const User = require('../models/User');

class NotificationService {
    constructor() {
        // Initialize notification service
        // In production, integrate with Firebase, OneSignal, etc.
        console.log('Notification service initialized');
    }

    async sendPushNotification(userId, notification) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.deviceToken) return;

            // In production, send push notification via FCM or APNS
            console.log(`Sending push notification to user ${userId}:`, notification);

            // Simulate sending notification
            return { success: true, message: 'Notification sent' };
        } catch (error) {
            console.error('Error sending push notification:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPriceAlert(userId, symbol, price, condition) {
        return await this.sendPushNotification(userId, {
            type: 'price_alert',
            title: `Price Alert: ${symbol}`,
            body: `${symbol} is now ₦${price} (${condition})`,
            data: {
                symbol,
                price: price.toString(),
                condition,
                timestamp: new Date().toISOString()
            }
        });
    }

    async sendTradeSignal(userId, signal) {
        return await this.sendPushNotification(userId, {
            type: 'trade_signal',
            title: `Trade Signal: ${signal.symbol}`,
            body: `${signal.action.toUpperCase()} - Confidence: ${signal.confidence}%`,
            data: {
                ...signal,
                timestamp: new Date().toISOString()
            }
        });
    }

    async sendSocialNotification(userId, notification) {
        return await this.sendPushNotification(userId, {
            type: 'social',
            ...notification
        });
    }

    async sendEmailNotification(userId, subject, body) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.email || !user.settings?.notifications?.email) return;

            // In production, integrate with email service (SendGrid, Mailgun, etc.)
            console.log(`Sending email to ${user.email}: ${subject}`);
            
            return { success: true, message: 'Email sent' };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendTradeConfirmation(userId, trade) {
        const subject = `Trade Confirmation - ${trade.action.toUpperCase()} ${trade.symbol}`;
        const body = `
            Your ${trade.action} order for ${trade.quantity} shares of ${trade.symbol} 
            at ₦${trade.price} has been ${trade.status}.
            Total: ₦${trade.totalAmount}
        `;

        await this.sendEmailNotification(userId, subject, body);
        await this.sendPushNotification(userId, {
            type: 'trade_confirmation',
            title: 'Trade Confirmed',
            body: `${trade.action.toUpperCase()} ${trade.quantity} ${trade.symbol} at ₦${trade.price}`,
            data: trade
        });
    }
}

module.exports = new NotificationService();
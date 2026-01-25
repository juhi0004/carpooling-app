const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Email service
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class NotificationService {
  // Create and send notification
  async sendNotification(recipientId, type, title, message, channels = ['in_app'], data = {}) {
    try {
      // Get recipient details
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Create notification record
      const notification = new Notification({
        recipient: recipientId,
        type,
        title,
        message,
        data,
        channels: channels.map((ch) => ({
          type: ch,
          status: 'pending',
        })),
      });

      await notification.save();

      // Send via each channel
      for (const channel of channels) {
        try {
          if (channel === 'email') {
            await this.sendEmail(recipient.email, title, message, data);
            notification.channels.find((c) => c.type === 'email').status = 'sent';
          } else if (channel === 'push') {
            if (recipient.deviceTokens && recipient.deviceTokens.length > 0) {
              await this.sendPushNotification(recipient.deviceTokens, title, message, data);
              notification.channels.find((c) => c.type === 'push').status = 'sent';
            }
          } else if (channel === 'in_app') {
            // In-app is already stored in DB
            notification.channels.find((c) => c.type === 'in_app').status = 'sent';
          }

          notification.channels.find((c) => c.type === channel).sentAt = new Date();
        } catch (error) {
          console.error(`Error sending ${channel}:`, error);
          notification.channels.find((c) => c.type === channel).status = 'failed';
          notification.channels.find((c) => c.type === channel).error = error.message;
        }
      }

      notification.status = 'sent';
      await notification.save();

      return notification;
    } catch (error) {
      throw new Error(`Error sending notification: ${error.message}`);
    }
  }

  // Send Email
  async sendEmail(email, subject, message, data) {
    try {
      const htmlContent = this.getEmailTemplate(subject, message, data);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subject,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Email error: ${error.message}`);
    }
  }

  // Send Push Notification via Firebase
  async sendPushNotification(deviceTokens, title, message, data = {}) {
    try {
      const tokens = deviceTokens.map((dt) => dt.token);

      const payload = {
        notification: {
          title: title,
          body: message,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      };

      // Send to all device tokens
      const response = await admin.messaging().sendMulticast({
        tokens: tokens,
        ...payload,
      });

      // Log results
      console.log(`Push sent to ${response.successCount} devices`);

      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.warn(`Failed tokens:`, failedTokens);
      }

      return response;
    } catch (error) {
      throw new Error(`Push notification error: ${error.message}`);
    }
  }

  // Email Template
  getEmailTemplate(subject, message, data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0284c7; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${subject}</h2>
            </div>
            <div class="content">
              <p>${message}</p>
              ${
                data.tripDetails
                  ? `
                <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #0284c7;">
                  <p><strong>Trip Details:</strong></p>
                  <p>From: ${data.tripDetails.source}</p>
                  <p>To: ${data.tripDetails.destination}</p>
                  <p>Departure: ${new Date(data.tripDetails.departureTime).toLocaleString()}</p>
                </div>
              `
                  : ''
              }
              ${
                data.amount
                  ? `
                <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #22c55e;">
                  <p><strong>Amount: ₹${data.amount}</strong></p>
                </div>
              `
                  : ''
              }
            </div>
            <div class="footer">
              <p>© 2026 RideShare App. All rights reserved.</p>
              <p>This is an automated notification. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Register device token
  async registerDeviceToken(userId, token, platform) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if token already exists
      const existingToken = user.deviceTokens.find((dt) => dt.token === token);
      if (!existingToken) {
        user.deviceTokens.push({
          token,
          platform,
          registeredAt: new Date(),
        });

        // Keep only last 5 devices
        if (user.deviceTokens.length > 5) {
          user.deviceTokens = user.deviceTokens.slice(-5);
        }

        await user.save();
      }

      return { success: true, message: 'Device token registered' };
    } catch (error) {
      throw new Error(`Error registering token: ${error.message}`);
    }
  }

  // Get notifications for user
  async getNotifications(userId, filters = {}) {
    try {
      const query = { recipient: userId };

      if (filters.isRead !== undefined) {
        query.isRead = filters.isRead;
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('trip', 'source destination')
        .populate('payment', 'amount status');

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });

      return count;
    } catch (error) {
      throw new Error(`Error counting unread: ${error.message}`);
    }
  }

  // Mark as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.recipient.toString() !== userId) {
        throw new Error('Unauthorized');
      }

      notification.isRead = true;
      notification.readAt = new Date();

      await notification.save();

      return notification;
    } catch (error) {
      throw new Error(`Error marking as read: ${error.message}`);
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.recipient.toString() !== userId) {
        throw new Error('Unauthorized');
      }

      await Notification.findByIdAndDelete(notificationId);

      return { success: true, message: 'Notification deleted' };
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // Mark all as read
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      throw new Error(`Error marking all as read: ${error.message}`);
    }
  }

  // Trigger notifications for different events
  async onTripCreated(trip, driverName) {
    return this.sendNotification(
      trip.driver,
      'trip_available',
      'Trip Created Successfully',
      `Your trip from ${trip.source.address} to ${trip.destination.address} has been posted`,
      ['in_app', 'email'],
      {
        driverName,
        tripDetails: {
          source: trip.source.address,
          destination: trip.destination.address,
          departureTime: trip.departureTime,
        },
      }
    );
  }

  async onRiderJoined(trip, riderName, driverId) {
    return this.sendNotification(
      driverId,
      'rider_joined',
      'New Rider Joined',
      `${riderName} has joined your trip. ${trip.totalSeats - trip.availableSeats} seats booked.`,
      ['in_app', 'push', 'email'],
      {
        riderName,
        tripDetails: {
          source: trip.source.address,
          destination: trip.destination.address,
        },
      }
    );
  }

  async onPaymentReceived(userId, amount, tripDetails) {
    return this.sendNotification(
      userId,
      'payment_received',
      'Payment Confirmed',
      `Your payment of ₹${amount} has been confirmed for your upcoming trip`,
      ['in_app', 'email'],
      {
        amount,
        tripDetails,
      }
    );
  }

  async onTripStarted(tripId, driverId, riderIds) {
    // Notify driver
    await this.sendNotification(
      driverId,
      'trip_started',
      'Trip Started',
      'Your trip has started. Safe travels!',
      ['in_app', 'push']
    );

    // Notify all riders
    for (const riderId of riderIds) {
      await this.sendNotification(
        riderId,
        'trip_started',
        'Your Ride Started',
        'Your driver has started the journey',
        ['in_app', 'push']
      );
    }
  }

  async onTripCompleted(trip, rating) {
    // Notify driver
    await this.sendNotification(
      trip.driver,
      'trip_completed',
      'Trip Completed',
      `Trip completed! Rating: ${rating || 'Pending'}`,
      ['in_app', 'email']
    );

    // Notify all riders
    for (const rider of trip.riders) {
      await this.sendNotification(
        rider.rider,
        'trip_completed',
        'Trip Completed',
        'Your trip has been completed. Thank you for using RideShare!',
        ['in_app', 'email']
      );
    }
  }
}

module.exports = new NotificationService();

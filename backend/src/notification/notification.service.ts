import { Injectable } from '@nestjs/common';

/**
 * Notification Service
 *
 * Handles all notification delivery across channels.
 * This is a cross-cutting service available to other modules.
 * Currently contains placeholder implementations.
 *
 * Supported channels (future):
 * - Email
 * - SMS
 * - Push notifications
 * - In-app notifications
 */
@Injectable()
export class NotificationService {
  /**
   * Send an email notification
   */
  async sendEmail(emailData: EmailNotificationDto): Promise<unknown> {
    // TODO: Integrate with email service (SendGrid, SES, etc.)
    return {
      notificationId: 'notif-' + Date.now(),
      channel: 'email',
      status: 'sent',
      recipient: emailData.to,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Send an SMS notification
   */
  async sendSms(smsData: SmsNotificationDto): Promise<unknown> {
    // TODO: Integrate with SMS service (Twilio, etc.)
    return {
      notificationId: 'notif-' + Date.now(),
      channel: 'sms',
      status: 'sent',
      recipient: smsData.phoneNumber,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Send a push notification
   */
  async sendPush(pushData: PushNotificationDto): Promise<unknown> {
    // TODO: Integrate with push service (FCM, APNs, etc.)
    return {
      notificationId: 'notif-' + Date.now(),
      channel: 'push',
      status: 'sent',
      recipient: pushData.userId,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(orderId: string, userId: string): Promise<void> {
    // TODO: Implement order confirmation notification
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusUpdate(orderId: string, status: string): Promise<void> {
    // TODO: Implement order status notification
  }

  /**
   * Send prescription verification notification
   */
  async sendPrescriptionVerified(prescriptionId: string, userId: string): Promise<void> {
    // TODO: Implement prescription notification
  }

  /**
   * Send password reset notification
   */
  async sendPasswordReset(userId: string, resetToken: string): Promise<void> {
    // TODO: Implement password reset notification
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId: string): Promise<unknown[]> {
    // TODO: Implement with database
    return [];
  }
}

/**
 * DTO for email notifications
 */
interface EmailNotificationDto {
  to: string;
  subject: string;
  body: string;
  template?: string;
  templateData?: Record<string, unknown>;
}

/**
 * DTO for SMS notifications
 */
interface SmsNotificationDto {
  phoneNumber: string;
  message: string;
}

/**
 * DTO for push notifications
 */
interface PushNotificationDto {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

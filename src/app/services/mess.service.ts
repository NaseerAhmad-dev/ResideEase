import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessEnrollment, MessNotification, MessStats } from '../models/mess.model';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class MessService {
  private enrollments = new BehaviorSubject<MessEnrollment[]>([]);
  private notifications = new BehaviorSubject<MessNotification[]>([]);
  private readonly ENROLLMENTS_KEY = 'mess-enrollments';
  private readonly NOTIFICATIONS_KEY = 'mess-notifications';

  constructor() {
    this.loadEnrollments();
    this.loadNotifications();
  }

  // Enrollment methods
  getEnrollments() {
    return this.enrollments.asObservable();
  }

  getEnrollmentsValue() {
    return this.enrollments.value;
  }

  // Get today's enrollments
  getTodayEnrollments(): MessEnrollment[] {
    const today = new Date().toISOString().split('T')[0];
    return this.enrollments.value.filter(e => e.enrollmentDate === today && e.status !== 'cancelled');
  }

  // Get pending enrollments for today
  getPendingEnrollments(): MessEnrollment[] {
    const today = new Date().toISOString().split('T')[0];
    return this.enrollments.value.filter(e =>
      e.enrollmentDate === today &&
      e.status === 'enrolled'
    );
  }

  // Enroll student for mess
  enrollStudent(student: Student, mealType: 'lunch' | 'dinner' | 'both' = 'both'): MessEnrollment | null {
    const today = new Date().toISOString().split('T')[0];

    const existingEnrollment = this.enrollments.value.find(e =>
      e.studentId === student.id &&
      e.enrollmentDate === today &&
      e.status !== 'cancelled'
    );

    if (existingEnrollment) {
      return existingEnrollment; // Return existing enrollment
    }

    const enrollment: MessEnrollment = {
      id: this.generateId(),
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      couponNumber: this.generateCouponNumber(),
      enrollmentDate: today,
      mealType,
      status: 'enrolled',
      createdAt: new Date().toISOString()
    };

    const currentEnrollments = this.enrollments.value;
    const updatedEnrollments = [...currentEnrollments, enrollment];
    this.enrollments.next(updatedEnrollments);
    this.saveEnrollmentsToStorage(updatedEnrollments);

    return enrollment;
  }

  // Validate coupon and mark as served
  validateAndServeCoupon(couponNumber: string, servedBy: string = 'Manager'): boolean {
    const today = new Date().toISOString().split('T')[0];
    const enrollment = this.enrollments.value.find(e =>
      e.couponNumber === couponNumber &&
      e.enrollmentDate === today &&
      e.status === 'enrolled'
    );

    if (!enrollment) return false;

    const currentEnrollments = this.enrollments.value;
    const updatedEnrollments = currentEnrollments.map(e =>
      e.id === enrollment.id
        ? { ...e, status: 'served' as const, servedAt: new Date().toISOString(), servedBy }
        : e
    );

    this.enrollments.next(updatedEnrollments);
    this.saveEnrollmentsToStorage(updatedEnrollments);
    return true;
  }

  // Get enrollment by coupon number
  getEnrollmentByCoupon(couponNumber: string): MessEnrollment | undefined {
    const today = new Date().toISOString().split('T')[0];
    return this.enrollments.value.find(e =>
      e.couponNumber === couponNumber &&
      e.enrollmentDate === today
    );
  }

  // Get stats for today
  getTodayStats(): MessStats {
    const today = new Date().toISOString().split('T')[0];
    const todayEnrollments = this.enrollments.value.filter(e => e.enrollmentDate === today);

    return {
      totalSubscribed: todayEnrollments.filter(e => e.status !== 'cancelled').length,
      totalServed: todayEnrollments.filter(e => e.status === 'served').length,
      pendingStudents: todayEnrollments.filter(e => e.status === 'enrolled').length,
      todayDate: today
    };
  }

  // Notification methods
  getNotifications() {
    return this.notifications.asObservable();
  }

  getNotificationsValue() {
    return this.notifications.value;
  }

  addNotification(notification: Omit<MessNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const newNotification: MessNotification = {
      ...notification,
      id: this.generateId(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const currentNotifications = this.notifications.value;
    const updatedNotifications = [newNotification, ...currentNotifications];
    this.notifications.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  markNotificationAsRead(id: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notifications.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  // Add notification when new student is onboarded
  notifyNewStudent(studentName: string): void {
    this.addNotification({
      type: 'new_student',
      title: 'New Student Onboarded',
      message: `${studentName} has been added to the hostel system.`,
      priority: 'medium'
    });
  }

  // Add timing notifications
  addTimingNotification(mealType: 'lunch' | 'dinner', timing: string): void {
    this.addNotification({
      type: 'timing',
      title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Timing`,
      message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} will be served at ${timing}`,
      priority: 'high'
    });
  }

  // Add general announcement
  addAnnouncement(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    this.addNotification({
      type: 'announcement',
      title,
      message,
      priority
    });
  }

  private generateId(): string {
    return 'mess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateCouponNumber(): string {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `M${today}${random}`;
  }

  private loadEnrollments(): void {
    try {
      const stored = localStorage.getItem(this.ENROLLMENTS_KEY);
      if (stored) {
        const parsedEnrollments = JSON.parse(stored);
        this.enrollments.next(parsedEnrollments);
      }
    } catch (error) {
      console.error('Failed to load enrollments from storage:', error);
    }
  }

  private saveEnrollmentsToStorage(enrollments: MessEnrollment[]): void {
    try {
      localStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(enrollments));
    } catch (error) {
      console.error('Failed to save enrollments to storage:', error);
    }
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        this.notifications.next(parsedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  private saveNotificationsToStorage(notifications: MessNotification[]): void {
    try {
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }
}
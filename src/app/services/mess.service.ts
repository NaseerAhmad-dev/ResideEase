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
  private readonly ENROLLMENTS_KEY    = 'mess-enrollments';
  private readonly NOTIFICATIONS_KEY  = 'mess-notifications';
  private readonly NOTIF_VERSION_KEY  = 'mess-notifications-version';
  private readonly NOTIF_SEED_VERSION = 'v1-initial';

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
      const today = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem(this.ENROLLMENTS_KEY);
      const existing: MessEnrollment[] = stored ? JSON.parse(stored) : [];
      const hasTodayData = existing.some(e => e.enrollmentDate === today);
      if (!hasTodayData) {
        const seeded = [...existing, ...this.getSeedEnrollments()];
        this.enrollments.next(seeded);
        this.saveEnrollmentsToStorage(seeded);
      } else {
        this.enrollments.next(existing);
      }
    } catch (error) {
      console.error('Failed to load enrollments from storage:', error);
    }
  }

  private getSeedEnrollments(): MessEnrollment[] {
    const today = new Date().toISOString().split('T')[0];
    const seed = [
      { roll: 'CSE-221', name: 'Aanya Sharma',  meal: 'both',   served: true,  minsAgo: 90 },
      { roll: 'CSE-222', name: 'Rohan Mehta',   meal: 'lunch',  served: true,  minsAgo: 70 },
      { roll: 'ECE-301', name: 'Priya Patel',   meal: 'dinner', served: true,  minsAgo: 45 },
      { roll: 'ME-412',  name: 'Arjun Kumar',   meal: 'both',   served: false, minsAgo: 0  },
      { roll: 'CSE-223', name: 'Sneha Iyer',    meal: 'both',   served: false, minsAgo: 0  },
      { roll: 'ECE-302', name: 'Vikram Singh',  meal: 'lunch',  served: false, minsAgo: 0  },
      { roll: 'CSE-224', name: 'Deepa Nair',    meal: 'dinner', served: false, minsAgo: 0  },
      { roll: 'ME-413',  name: 'Rahul Gupta',   meal: 'both',   served: false, minsAgo: 0  },
      { roll: 'CSE-225', name: 'Kavya Reddy',   meal: 'lunch',  served: false, minsAgo: 0  },
      { roll: 'ECE-303', name: 'Nikhil Joshi',  meal: 'dinner', served: true,  minsAgo: 30 },
    ];
    return seed.map((s, i) => ({
      id: `seed_enr_${i}`,
      studentId: `seed_stu_${i}`,
      studentName: s.name,
      rollNumber: s.roll,
      couponNumber: `M${today.replace(/-/g, '')}${1001 + i}`,
      enrollmentDate: today,
      mealType: s.meal as MessEnrollment['mealType'],
      status: s.served ? ('served' as const) : ('enrolled' as const),
      servedAt: s.served ? new Date(Date.now() - s.minsAgo * 60000).toISOString() : undefined,
      servedBy: s.served ? 'Manager' : undefined,
      createdAt: new Date(Date.now() - 120 * 60000).toISOString()
    }));
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
      const storedVersion = localStorage.getItem(this.NOTIF_VERSION_KEY);
      if (storedVersion !== this.NOTIF_SEED_VERSION) {
        const seed = this.getSeedNotifications();
        this.notifications.next(seed);
        localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(seed));
        localStorage.setItem(this.NOTIF_VERSION_KEY, this.NOTIF_SEED_VERSION);
      } else {
        const stored = localStorage.getItem(this.NOTIFICATIONS_KEY);
        this.notifications.next(stored ? JSON.parse(stored) : []);
      }
    } catch {
      this.notifications.next([]);
    }
  }

  private saveNotificationsToStorage(notifications: MessNotification[]): void {
    try { localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications)); } catch { /* noop */ }
  }

  private getSeedNotifications(): MessNotification[] {
    const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
    return [
      {
        id: 'notif_001', type: 'announcement',
        title: 'Mess Timing Update',
        message: 'Lunch will be served from 12:30 PM – 2:00 PM and Dinner from 7:30 PM – 9:00 PM, effective this Monday.',
        priority: 'high', isRead: false, createdAt: daysAgo(1)
      },
      {
        id: 'notif_002', type: 'announcement',
        title: 'Special Menu – Eid Celebration',
        message: 'A special menu featuring biryani, korma, and sheer khurma will be served for all hostel residents.',
        priority: 'medium', isRead: true, createdAt: daysAgo(5)
      },
      {
        id: 'notif_003', type: 'maintenance',
        title: 'Mess Closed – Sunday Deep Clean',
        message: 'The mess will be closed this Sunday for deep cleaning. Packed meals will be provided at 1:00 PM and 8:00 PM.',
        priority: 'high', isRead: false, createdAt: daysAgo(2)
      },
      {
        id: 'notif_004', type: 'announcement',
        title: 'Monthly Feedback Form',
        message: 'Please fill the mess feedback form available at the mess counter. Your feedback helps improve food quality.',
        priority: 'low', isRead: true, createdAt: daysAgo(8)
      },
      {
        id: 'notif_005', type: 'timing',
        title: 'Breakfast Added',
        message: 'Starting next week, breakfast (7:30 AM – 9:00 AM) will be included in the monthly mess fee at no extra charge.',
        priority: 'medium', isRead: false, createdAt: daysAgo(3)
      }
    ];
  }
}
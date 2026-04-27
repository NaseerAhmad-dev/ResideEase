import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessService } from '../services/mess.service';
import { MessEnrollment, MessNotification, MessStats } from '../models/mess.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [MessService],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {
  managerName = 'Hostel Manager';
  hostelName = 'Maple Residency';

  // Mess data
  todayEnrollments: MessEnrollment[] = [];
  pendingEnrollments: MessEnrollment[] = [];
  messStats: MessStats = { totalSubscribed: 0, totalServed: 0, pendingStudents: 0, todayDate: '' };
  notifications: MessNotification[] = [];
  couponInput = '';
  validationMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly router: Router,
    @Inject(MessService) private readonly messService: MessService
  ) {}

  ngOnInit(): void {
    this.loadMessData();
    this.subscriptions.push(
      this.messService.getEnrollments().subscribe(() => this.loadMessData()),
      this.messService.getNotifications().subscribe(notifications => {
        this.notifications = notifications.slice(0, 5); // Show latest 5 notifications
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadMessData(): void {
    this.todayEnrollments = this.messService.getTodayEnrollments();
    this.pendingEnrollments = this.messService.getPendingEnrollments();
    this.messStats = this.messService.getTodayStats();
  }

  validateCoupon(): void {
    if (!this.couponInput.trim()) {
      this.validationMessage = 'Please enter a coupon number';
      return;
    }

    const success = this.messService.validateAndServeCoupon(this.couponInput.trim());
    if (success) {
      this.validationMessage = '✅ Coupon validated! Meal served.';
      this.couponInput = '';
      setTimeout(() => this.validationMessage = '', 3000);
    } else {
      this.validationMessage = '❌ Invalid or already used coupon';
    }
  }

  markNotificationAsRead(notificationId: string): void {
    this.messService.markNotificationAsRead(notificationId);
  }

  addTimingNotification(mealType: 'lunch' | 'dinner'): void {
    const timing = mealType === 'lunch' ? '12:00 PM - 2:00 PM' : '7:00 PM - 9:00 PM';
    this.messService.addTimingNotification(mealType, timing);
  }

  addAnnouncement(): void {
    const title = 'Important Notice';
    const message = 'Please maintain cleanliness in the mess area. Thank you!';
    this.messService.addAnnouncement(title, message, 'medium');
  }

  signOut(): void {
    this.router.navigate(['/manager/login']);
  }

  quickActions = [
    { title: 'Review room requests', subtitle: 'Approve or decline room change requests', icon: 'request' },
    { title: 'Check occupancy', subtitle: 'View active residents and room status', icon: 'rooms' },
    { title: 'Approve maintenance', subtitle: 'Authorize pending maintenance tickets', icon: 'maintenance' },
    { title: 'Send notice', subtitle: 'Publish a new announcement to residents', icon: 'notice' }
  ];
  stats = [
    { title: 'Active residents', value: '128', subtitle: 'Currently staying', accent: 'brand' },
    { title: 'Pending requests', value: '6', subtitle: 'Awaiting approval', accent: 'amber' },
    { title: 'Open tasks', value: '12', subtitle: 'This week', accent: 'green' },
    { title: 'Rooms available', value: '9', subtitle: 'Ready for occupancy', accent: 'sky' }
  ];
  todayTasks = [
    { title: 'Inspect east wing rooms', status: 'Due today' },
    { title: 'Review new applications', status: 'Waiting approval' },
    { title: 'Confirm laundry pickups', status: 'In progress' }
  ];
}

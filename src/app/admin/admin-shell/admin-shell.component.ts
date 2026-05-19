import { Component, HostListener, ElementRef, signal, computed, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss'
})
export class AdminShellComponent {
  private readonly router = inject(Router);
  private readonly elRef = inject(ElementRef);

  sidebarOpen = signal(true);
  showNotifications = signal(false);
  showProfileMenu = signal(false);

  notifications: AppNotification[] = [
    { id: '1', title: 'New student registered', message: 'Aanya Sharma completed onboarding for Room 204.', time: '5 min ago', type: 'info', read: false },
    { id: '2', title: 'Payment received', message: '₹12,500 received from Rohan Mehta (Roll: CSE-221).', time: '1 hr ago', type: 'success', read: false },
    { id: '3', title: 'Maintenance request', message: 'Room 112 reported a plumbing issue. Assign a technician.', time: '3 hr ago', type: 'warning', read: false },
    { id: '4', title: 'Mess enrollment updated', message: '14 students switched to vegetarian plan for next month.', time: 'Yesterday', type: 'info', read: true },
    { id: '5', title: 'Room checkout', message: 'Priya Nair (Room 301) has checked out successfully.', time: 'Yesterday', type: 'success', read: true },
  ];

  unreadCount = computed(() => this.notifications.filter(n => !n.read).length);

  navItems: NavItem[] = [
    { label: 'Overview',   route: '/admin/dashboard', icon: 'grid' },
    { label: 'Students',   route: '/admin/students',  icon: 'users', badge: 3 },
    { label: 'Rooms',      route: '/admin/rooms',     icon: 'door' },
    { label: 'Mess',       route: '/admin/mess',      icon: 'fork' },
    { label: 'Payments',   route: '/admin/payments',  icon: 'credit', badge: 5 },
    { label: 'Notices',    route: '/admin/notices',   icon: 'bell' },
    { label: 'Requests',   route: '/admin/requests',  icon: 'wrench' },
  ];

  bottomNav: NavItem[] = [
    { label: 'Settings', route: '/admin/settings', icon: 'gear' },
  ];

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showProfileMenu.set(false);
    this.showNotifications.update(v => !v);
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.showNotifications.set(false);
    this.showProfileMenu.update(v => !v);
  }

  markAllRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  goToSettings(): void {
    this.showProfileMenu.set(false);
    this.router.navigate(['/admin/settings']);
  }

  signOut(): void {
    this.showProfileMenu.set(false);
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showNotifications.set(false);
      this.showProfileMenu.set(false);
    }
  }
}

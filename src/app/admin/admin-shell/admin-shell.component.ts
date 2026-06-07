import { Component, HostListener, ElementRef, signal, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../../environments/environment';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss'
})
export class AdminShellComponent implements OnInit {
  private readonly router              = inject(Router);
  private readonly elRef               = inject(ElementRef);
  private readonly http                = inject(HttpClient);
  private readonly authService         = inject(AuthService);
  private readonly settingsService     = inject(SettingsService);
  readonly themeService                = inject(ThemeService);
  readonly notificationService         = inject(NotificationService);

  get userName():    string { return this.authService.getUser()?.name || 'Admin'; }
  get userInitial(): string { return this.userName[0].toUpperCase(); }
  get hostelName():  string { return this.settingsService.getSettings()().hostel.name || 'My Hostel'; }

  readonly notifications = this.notificationService.notifications;
  readonly unreadCount   = this.notificationService.unreadCount;

  sidebarOpen       = signal(true);
  showNotifications = signal(false);
  showProfileMenu   = signal(false);

  navItems: NavItem[] = [
    { label: 'Overview',   route: '/admin/dashboard', icon: 'grid'      },
    { label: 'Students',   route: '/admin/students',  icon: 'users',    badge: 3 },
    { label: 'Rooms',      route: '/admin/rooms',     icon: 'door'      },
    { label: 'Employees',  route: '/admin/employees', icon: 'briefcase' },
    { label: 'Mess',       route: '/admin/mess',      icon: 'fork'      },
    { label: 'Payments',   route: '/admin/payments',  icon: 'credit',   badge: 5 },
    { label: 'Notices',    route: '/admin/notices',   icon: 'bell'      },
    { label: 'Requests',   route: '/admin/requests',  icon: 'wrench'    },
  ];

  bottomNav: NavItem[] = [
    { label: 'Settings', route: '/admin/settings', icon: 'gear' },
  ];

  ngOnInit(): void {
    this.notificationService.load();
    this.loadBadgeCounts();
  }

  relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)   return 'Just now';
    if (m < 60)  return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h} hr ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'Yesterday';
    return `${d} days ago`;
  }

  private loadBadgeCounts(): void {
    const token = this.authService.getToken();
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.apiUrl}/dashboard/counts`, { headers }).subscribe({
      next: res => {
        if (!res.success) return;
        this.navItems = this.navItems.map(n => {
          if (n.route === '/admin/students')
            return { ...n, badge: res.data.pendingStudents || undefined };
          if (n.route === '/admin/payments')
            return { ...n, badge: res.data.overduePayments || undefined };
          return n;
        });
      },
      error: () => {},
    });
  }

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

  markAllRead(): void { this.notificationService.markAllRead(); }

  markRead(id: string): void { this.notificationService.markRead(id); }

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

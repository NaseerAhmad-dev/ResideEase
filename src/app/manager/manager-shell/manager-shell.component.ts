import { Component, signal, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessService } from '../../services/mess.service';
import { MessNotification } from '../../models/mess.model';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-manager-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './manager-shell.component.html',
  styleUrl: './manager-shell.component.scss'
})
export class ManagerShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly messService = inject(MessService);
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  sidebarOpen = signal(true);
  notifOpen   = signal(false);
  profileOpen = signal(false);

  notifications: MessNotification[] = [];
  private sub?: Subscription;

  navItems: NavItem[] = [
    { label: 'Overview', route: '/manager/dashboard', icon: 'grid'   },
    { label: 'Mess',     route: '/manager/mess',      icon: 'fork'   },
    { label: 'Rebates',  route: '/manager/rebates',   icon: 'rebate' },
    { label: 'Bills',    route: '/manager/bills',     icon: 'bill'   },
    { label: 'Notices',  route: '/manager/notices',   icon: 'bell'   },
    { label: 'Audit',    route: '/manager/audit',     icon: 'audit'  },
  ];

  bottomNav: NavItem[] = [
    { label: 'Settings', route: '/manager/settings', icon: 'gear' },
  ];

  ngOnInit(): void {
    this.sub = this.messService.getNotifications().subscribe(n => {
      this.notifications = n.slice(0, 6);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get recentNotifs(): MessNotification[] {
    return this.notifications.slice(0, 5);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.notifOpen.set(false);
    this.profileOpen.set(false);
  }

  stopProp(event: Event): void {
    event.stopPropagation();
  }

  toggleNotif(event: MouseEvent): void {
    event.stopPropagation();
    this.notifOpen.set(!this.notifOpen());
    this.profileOpen.set(false);
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen.set(!this.profileOpen());
    this.notifOpen.set(false);
  }

  markRead(id: string): void {
    this.messService.markNotificationAsRead(id);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  signOut(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }

  timeAgo(dateStr: string): string {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
  }
}

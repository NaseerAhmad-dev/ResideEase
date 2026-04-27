import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
export class AdminShellComponent {
  sidebarOpen = signal(true);

  navItems: NavItem[] = [
    { label: 'Overview',   route: '/admin/dashboard', icon: 'grid' },
    { label: 'Students',   route: '/admin/students',  icon: 'users', badge: 3 },
    { label: 'Rooms',      route: '/admin/rooms',     icon: 'door' },
    { label: 'Mess',       route: '/admin/mess',      icon: 'fork' },
    { label: 'Payments',   route: '/admin/payments',  icon: 'credit', badge: 5 },
    { label: 'Notices',    route: '/admin/notices',   icon: 'bell' },
  ];

  bottomNav: NavItem[] = [
    { label: 'Settings',  route: '/admin/settings',  icon: 'gear' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}

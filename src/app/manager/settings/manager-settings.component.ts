import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NotifPref {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-manager-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-settings.component.html',
  styleUrl: './manager-settings.component.scss'
})
export class ManagerSettingsComponent {
  activeTab: 'profile' | 'security' | 'notifications' = 'profile';

  profile = {
    name: 'Mess Manager',
    hostel: 'Maple Residency',
    email: 'manager@resideease.com',
    phone: '+91 98765 43210',
  };

  passwordForm = { current: '', newPass: '', confirm: '' };
  passwordError = '';
  passwordSuccess = false;

  saveStatus: 'idle' | 'saving' | 'success' = 'idle';

  notifPrefs: NotifPref[] = [
    { id: 'meal_service',   label: 'Meal service alerts',     description: 'Notify when meal service starts or ends for the day',         enabled: true  },
    { id: 'new_enrollment', label: 'New enrollments',         description: 'Alert when students enroll for meals',                        enabled: true  },
    { id: 'rebate_request', label: 'Rebate requests',         description: 'Alert for new rebate applications awaiting your review',      enabled: true  },
    { id: 'coupon_summary', label: 'Daily coupon summary',    description: 'End-of-day summary of coupon validations',                    enabled: false },
    { id: 'low_enrollment', label: 'Low enrollment warning',  description: 'Alert when enrollment drops below the expected threshold',    enabled: true  },
    { id: 'admin_notices',  label: 'Admin notices',           description: 'Notify when the admin posts a new hostel notice',             enabled: false },
  ];

  saveProfile(): void {
    this.saveStatus = 'saving';
    setTimeout(() => {
      this.saveStatus = 'success';
      setTimeout(() => (this.saveStatus = 'idle'), 3000);
    }, 600);
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = false;
    if (!this.passwordForm.current) { this.passwordError = 'Enter your current password.'; return; }
    if (this.passwordForm.newPass.length < 8) { this.passwordError = 'New password must be at least 8 characters.'; return; }
    if (this.passwordForm.newPass !== this.passwordForm.confirm) { this.passwordError = 'Passwords do not match.'; return; }
    this.passwordSuccess = true;
    this.passwordForm = { current: '', newPass: '', confirm: '' };
    setTimeout(() => (this.passwordSuccess = false), 3500);
  }

  togglePref(pref: NotifPref): void {
    pref.enabled = !pref.enabled;
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}

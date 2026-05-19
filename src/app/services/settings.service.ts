import { Injectable, signal } from '@angular/core';
import { AppSettings, HostelSettings, RoomSettings, MealSettings, SystemSettings, PolicySettings, AdminProfile } from '../models/settings.model';
import { ROOM_OPTIONS, MEAL_PLANS, DIETARY_OPTIONS } from '../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly settings = signal<AppSettings>({
    hostel: {
      name: 'ResideEase Hostel',
      address: '123 University Road, Campus Area, Pune - 411007',
      phone: '+91 98765 43210',
      email: 'admin@resideease.com',
      website: 'https://resideease.com',
      description: 'Modern hostel accommodation for students with 24/7 security, Wi-Fi, and quality mess facilities.',
      totalRooms: 120,
      establishedYear: 2018,
      affiliation: 'Savitribai Phule Pune University',
      wardenName: 'Dr. Ramesh Kulkarni',
      wardenPhone: '+91 98765 43211'
    },
    rooms: ROOM_OPTIONS.map(room => ({
      id: room.id,
      label: room.label,
      price: room.price,
      securityDeposit: room.price * 2,
      enabled: true
    })),
    meals: MEAL_PLANS.map(meal => ({
      id: meal.id,
      label: meal.label,
      price: meal.price,
      enabled: true
    })),
    dietaryOptions: [...DIETARY_OPTIONS],
    policies: {
      checkInTime: '10:00',
      checkOutTime: '10:00',
      visitingHoursFrom: '06:00',
      visitingHoursTo: '21:00',
      lateFeePercent: 2,
      gracePeriodDays: 5,
      noticeBeforeCheckout: 30,
      guestMaxNights: 2
    },
    system: {
      allowOnlineBooking: true,
      requireApproval: true,
      maintenanceMode: false,
      notificationsEnabled: true,
      smsNotifications: false,
      autoReminderDays: 7,
      academicYear: '2025-26',
      maintenanceCharge: 500
    },
    guestFee: 200,
    admin: {
      name: 'Office Admin',
      email: 'admin@resideease.com',
      phone: '+91 98765 43210',
      designation: 'Hostel Office'
    }
  });

  getSettings() {
    return this.settings.asReadonly();
  }

  updateHostelSettings(settings: Partial<HostelSettings>) {
    this.settings.update(current => ({
      ...current,
      hostel: { ...current.hostel, ...settings }
    }));
  }

  updateRoomSettings(roomId: string, settings: Partial<RoomSettings>) {
    this.settings.update(current => ({
      ...current,
      rooms: current.rooms.map(room =>
        room.id === roomId ? { ...room, ...settings } : room
      )
    }));
  }

  updateMealSettings(mealId: string, settings: Partial<MealSettings>) {
    this.settings.update(current => ({
      ...current,
      meals: current.meals.map(meal =>
        meal.id === mealId ? { ...meal, ...settings } : meal
      )
    }));
  }

  updateDietaryOptions(options: string[]) {
    this.settings.update(current => ({
      ...current,
      dietaryOptions: [...options]
    }));
  }

  updateSystemSettings(settings: Partial<SystemSettings>) {
    this.settings.update(current => ({
      ...current,
      system: { ...current.system, ...settings }
    }));
  }

  updatePolicySettings(settings: Partial<PolicySettings>) {
    this.settings.update(current => ({
      ...current,
      policies: { ...current.policies, ...settings }
    }));
  }

  updateAdminProfile(profile: Partial<AdminProfile>) {
    this.settings.update(current => ({
      ...current,
      admin: { ...current.admin, ...profile }
    }));
  }

  saveSettings() {
    const settings = this.settings();
    localStorage.setItem('hostel-settings', JSON.stringify(settings));
    return Promise.resolve();
  }

  loadSettings() {
    const saved = localStorage.getItem('hostel-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings.update(current => ({
          ...current,
          ...parsed,
          hostel: { ...current.hostel, ...parsed.hostel },
          policies: { ...current.policies, ...parsed.policies },
          system: { ...current.system, ...parsed.system },
          admin: { ...current.admin, ...parsed.admin }
        }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }
}

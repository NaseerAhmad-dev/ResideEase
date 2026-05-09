import { Injectable, signal } from '@angular/core';
import { AppSettings, HostelSettings, RoomSettings, MealSettings, SystemSettings } from '../models/settings.model';
import { ROOM_OPTIONS, MEAL_PLANS, DIETARY_OPTIONS } from '../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly settings = signal<AppSettings>({
    hostel: {
      name: 'ResideEase Hostel',
      address: '123 University Road, Campus Area',
      phone: '+91 98765 43210',
      email: 'admin@resideease.com',
      website: 'https://resideease.com',
      description: 'Modern hostel accommodation for students'
    },
    rooms: ROOM_OPTIONS.map(room => ({
      id: room.id,
      label: room.label,
      price: room.price,
      enabled: true
    })),
    meals: MEAL_PLANS.map(meal => ({
      id: meal.id,
      label: meal.label,
      price: meal.price,
      enabled: true
    })),
    dietaryOptions: [...DIETARY_OPTIONS],
    guestFee: 200,
    system: {
      allowOnlineBooking: true,
      requireApproval: true,
      maintenanceMode: false,
      notificationsEnabled: true
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

  saveSettings() {
    // In a real app, this would save to a backend
    const settings = this.settings();
    localStorage.setItem('hostel-settings', JSON.stringify(settings));
    return Promise.resolve();
  }

  loadSettings() {
    const saved = localStorage.getItem('hostel-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings.update(current => ({ ...current, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GuestRegistration } from '../models/guest.model';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class GuestService {
  private guests = new BehaviorSubject<GuestRegistration[]>(this.loadGuests());
  private currentOtp = '';
  private otpPhone = '';

  constructor(private settingsService: SettingsService) {}

  private loadGuests(): GuestRegistration[] {
    const saved = localStorage.getItem('hostel-guests');
    return saved ? JSON.parse(saved) : [];
  }

  private persist(guests: GuestRegistration[]) {
    localStorage.setItem('hostel-guests', JSON.stringify(guests));
  }

  getGuests() {
    return this.guests.asObservable();
  }

  getGuestsValue(): GuestRegistration[] {
    return this.guests.value;
  }

  generateOtp(phone: string): string {
    this.otpPhone = phone;
    this.currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return this.currentOtp;
  }

  validateOtp(otp: string, phone: string): boolean {
    return this.otpPhone === phone && this.currentOtp === otp;
  }

  getGuestFee(): number {
    return this.settingsService.getSettings()().guestFee ?? 200;
  }

  registerGuest(data: Omit<GuestRegistration, 'id' | 'registeredAt' | 'receiptNumber'>): GuestRegistration {
    const guest: GuestRegistration = {
      ...data,
      id: 'G' + Date.now(),
      registeredAt: new Date().toISOString(),
      receiptNumber: 'GR-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    };
    const updated = [...this.guests.value, guest];
    this.guests.next(updated);
    this.persist(updated);
    return guest;
  }
}

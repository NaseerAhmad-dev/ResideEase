import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notice, NoticeCategory, NoticePriority } from '../models/notice.model';

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private readonly notices = new BehaviorSubject<Notice[]>([]);
  private readonly STORAGE_KEY  = 'hostel-notices';
  private readonly VERSION_KEY  = 'hostel-notices-version';
  private readonly SEED_VERSION = 'v1-initial';

  constructor() { this.load(); }

  getNotices(): Observable<Notice[]> { return this.notices.asObservable(); }
  getNoticesValue(): Notice[]        { return this.notices.value; }

  addNotice(data: Omit<Notice, 'id' | 'createdAt'>): Notice {
    const notice: Notice = { ...data, id: this.genId(), createdAt: new Date().toISOString() };
    const updated = [notice, ...this.notices.value];
    this.notices.next(updated);
    this.save(updated);
    return notice;
  }

  updateNotice(id: string, updates: Partial<Notice>): void {
    const updated = this.notices.value.map(n => n.id === id ? { ...n, ...updates } : n);
    this.notices.next(updated);
    this.save(updated);
  }

  deleteNotice(id: string): void {
    const updated = this.notices.value.filter(n => n.id !== id);
    this.notices.next(updated);
    this.save(updated);
  }

  togglePin(id: string): void {
    const notice = this.notices.value.find(n => n.id === id);
    if (notice) this.updateNotice(id, { isPinned: !notice.isPinned });
  }

  private genId(): string { return 'ntc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9); }

  private load(): void {
    try {
      if (localStorage.getItem(this.VERSION_KEY) !== this.SEED_VERSION) {
        const seed = this.seed();
        this.notices.next(seed);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
        localStorage.setItem(this.VERSION_KEY, this.SEED_VERSION);
      } else {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        this.notices.next(raw ? JSON.parse(raw) : this.seed());
      }
    } catch { this.notices.next(this.seed()); }
  }

  private save(notices: Notice[]): void {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notices)); } catch { /* noop */ }
  }

  private seed(): Notice[] {
    const ago  = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
    const exp  = (d: number) => new Date(Date.now() + d * 86400000).toISOString().split('T')[0];
    return [
      {
        id: 'ntc_001', title: 'Water Supply Disruption – Urgent',
        content: 'Due to an emergency repair in the main pipeline, water supply will be suspended from 10:00 PM tonight until 6:00 AM tomorrow. Please store water accordingly. We apologise for the inconvenience.',
        category: 'maintenance', priority: 'urgent', postedBy: 'Office Admin',
        isPinned: true, expiresAt: exp(1), createdAt: ago(0)
      },
      {
        id: 'ntc_002', title: 'End Semester Examination Schedule',
        content: 'The end semester examinations will commence from 10th June 2026. All students are advised to collect their hall tickets from the administrative office before 5th June. No hall ticket will be issued on the day of examination.',
        category: 'academic', priority: 'important', postedBy: 'Office Admin',
        isPinned: true, expiresAt: exp(25), createdAt: ago(2)
      },
      {
        id: 'ntc_003', title: 'Fire Drill – This Saturday',
        content: 'A mandatory fire drill will be conducted this Saturday at 10:00 AM. All hostel residents must participate. Please assemble at the designated muster point near the main gate. Attendance will be marked.',
        category: 'hostel', priority: 'urgent', postedBy: 'Office Admin',
        isPinned: true, expiresAt: exp(4), createdAt: ago(1)
      },
      {
        id: 'ntc_004', title: 'Fee Payment – Last Date Reminder',
        content: 'This is a reminder that the last date for fee payment for the current semester is 31st May 2026. Students with pending dues are advised to clear their payments immediately to avoid late fine charges.',
        category: 'general', priority: 'important', postedBy: 'Office Admin',
        isPinned: false, expiresAt: exp(15), createdAt: ago(3)
      },
      {
        id: 'ntc_005', title: 'Elevator Under Maintenance',
        content: 'The elevator in Block B will be under maintenance from 18th to 20th May. Students residing on floors 3–5 are requested to use the staircase during this period. Normal service will resume by 21st May.',
        category: 'maintenance', priority: 'normal', postedBy: 'Office Admin',
        isPinned: false, expiresAt: exp(5), createdAt: ago(4)
      },
      {
        id: 'ntc_006', title: 'Library Extended Hours',
        content: 'The hostel library will remain open until midnight (12:00 AM) from 15th May to 15th June to support students during exam preparation. Students must carry their ID cards at all times.',
        category: 'academic', priority: 'normal', postedBy: 'Office Admin',
        isPinned: false, expiresAt: exp(30), createdAt: ago(5)
      },
      {
        id: 'ntc_007', title: 'Visiting Hours Updated',
        content: 'With effect from 1st June, visiting hours for guests will be 10:00 AM – 6:00 PM on weekdays and 9:00 AM – 8:00 PM on weekends. All visitors must sign the visitor register at the reception desk.',
        category: 'hostel', priority: 'normal', postedBy: 'Office Admin',
        isPinned: false, createdAt: ago(7)
      },
      {
        id: 'ntc_008', title: 'Welcome – New Residents',
        content: 'The hostel management warmly welcomes all new residents for the academic year 2025–26. An orientation session will be held on 25th May at 3:00 PM in the common hall. Attendance is compulsory for all new students.',
        category: 'general', priority: 'normal', postedBy: 'Office Admin',
        isPinned: false, createdAt: ago(10)
      }
    ];
  }
}

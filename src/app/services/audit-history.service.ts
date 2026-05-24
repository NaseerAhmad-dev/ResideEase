import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PublishedAuditRow {
  studentId:   string;
  studentName: string;
  rollNumber:  string;
  rebateDays:  number;
  billableDays: number;
  billAmount:  number;
}

export interface PublishedAudit {
  id:                string;
  month:             number;
  year:              number;
  publishedAt:       string;
  daysInMonth:       number;
  totalSupplierBill: number;
  totalBillableDays: number;
  perDayRate:        number;
  studentCount:      number;
  rebatedCount:      number;
  totalStudentBill:  number;
  rows:              PublishedAuditRow[];
}

@Injectable({ providedIn: 'root' })
export class AuditHistoryService {
  private readonly STORAGE_KEY = 'hostel-audit-history';
  private readonly audits$ = new BehaviorSubject<PublishedAudit[]>(this.load());

  getAll(): Observable<PublishedAudit[]> {
    return this.audits$.asObservable();
  }

  getForMonth(month: number, year: number): PublishedAudit | undefined {
    return this.audits$.getValue().find(a => a.month === month && a.year === year);
  }

  publish(data: Omit<PublishedAudit, 'id' | 'publishedAt'>): PublishedAudit {
    const audit: PublishedAudit = {
      ...data,
      id:          `audit_${data.year}_${String(data.month).padStart(2, '0')}`,
      publishedAt: new Date().toISOString(),
    };
    // Replace any existing audit for the same month/year
    const rest = this.audits$.getValue().filter(a => !(a.month === data.month && a.year === data.year));
    const updated = [audit, ...rest].sort((a, b) => b.year - a.year || b.month - a.month);
    this.save(updated);
    this.audits$.next(updated);
    return audit;
  }

  private load(): PublishedAudit[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private save(audits: PublishedAudit[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(audits));
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RebateRequest, RebateDays } from '../models/rebate.model';

@Injectable({ providedIn: 'root' })
export class RebateService {
  private requests = new BehaviorSubject<RebateRequest[]>([]);
  private readonly STORAGE_KEY    = 'hostel-rebates';
  private readonly VERSION_KEY    = 'hostel-rebates-version';
  private readonly SEED_VERSION   = 'v1-initial';

  constructor() {
    this.load();
  }

  getRequests() {
    return this.requests.asObservable();
  }

  getRequestsValue() {
    return this.requests.value;
  }

  getActiveRebate(studentId: string): RebateRequest | undefined {
    return this.requests.value.find(
      r => r.studentId === studentId && (r.status === 'pending' || r.status === 'approved')
    );
  }

  getStudentHistory(studentId: string): RebateRequest[] {
    return this.requests.value.filter(r => r.studentId === studentId);
  }

  getPendingRequests(): RebateRequest[] {
    return this.requests.value.filter(r => r.status === 'pending');
  }

  getAllManagerRequests(): RebateRequest[] {
    return [...this.requests.value].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  submitRequest(studentId: string, studentName: string, rollNumber: string, days: RebateDays): RebateRequest {
    const request: RebateRequest = {
      id: 'reb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      studentId,
      studentName,
      rollNumber,
      days,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    const updated = [...this.requests.value, request];
    this.requests.next(updated);
    this.save(updated);
    return request;
  }

  cancelRequest(id: string): void {
    this.updateStatus(id, 'cancelled');
  }

  approveRequest(id: string, reviewedBy = 'Manager'): void {
    this.updateStatus(id, 'approved', reviewedBy);
  }

  rejectRequest(id: string, reviewedBy = 'Manager'): void {
    this.updateStatus(id, 'rejected', reviewedBy);
  }

  private updateStatus(id: string, status: RebateRequest['status'], reviewedBy?: string): void {
    const updated = this.requests.value.map(r =>
      r.id === id
        ? { ...r, status, ...(reviewedBy ? { reviewedBy, reviewedAt: new Date().toISOString() } : {}) }
        : r
    );
    this.requests.next(updated);
    this.save(updated);
  }

  private load(): void {
    try {
      const version = localStorage.getItem(this.VERSION_KEY);
      const stored  = localStorage.getItem(this.STORAGE_KEY);
      if (stored && version === this.SEED_VERSION) {
        this.requests.next(JSON.parse(stored));
      } else {
        const seed = this.getSeedRequests();
        this.requests.next(seed);
        this.save(seed);
        localStorage.setItem(this.VERSION_KEY, this.SEED_VERSION);
      }
    } catch {
      this.requests.next(this.getSeedRequests());
    }
  }

  private getSeedRequests(): RebateRequest[] {
    const d = (daysAgo: number, hoursAgo = 0) => {
      const dt = new Date();
      dt.setDate(dt.getDate() - daysAgo);
      dt.setHours(dt.getHours() - hoursAgo);
      return dt.toISOString();
    };
    const reviewed = (daysAgo: number) => {
      const dt = new Date();
      dt.setDate(dt.getDate() - daysAgo);
      return dt.toISOString();
    };
    return [
      { id: 'reb_seed_001', studentId: 'std_001', studentName: 'Amir Wani',    rollNumber: 'CS2021001', days: 14, status: 'pending',   requestedAt: d(1, 2) },
      { id: 'reb_seed_002', studentId: 'std_002', studentName: 'Bhat Imran',   rollNumber: 'CS2021002', days: 10, status: 'pending',   requestedAt: d(1, 5) },
      { id: 'reb_seed_003', studentId: 'std_003', studentName: 'Khalid Mir',   rollNumber: 'CS2021003', days: 28, status: 'approved',  requestedAt: d(5), reviewedAt: reviewed(3), reviewedBy: 'Hostel Manager' },
      { id: 'reb_seed_004', studentId: 'std_004', studentName: 'Sajad Ahmad',  rollNumber: 'CS2021004', days: 10, status: 'approved',  requestedAt: d(8), reviewedAt: reviewed(6), reviewedBy: 'Hostel Manager' },
      { id: 'reb_seed_005', studentId: 'std_005', studentName: 'Faisal Lone',  rollNumber: 'CS2021005', days: 14, status: 'rejected',  requestedAt: d(10), reviewedAt: reviewed(8), reviewedBy: 'Hostel Manager' },
      { id: 'reb_seed_006', studentId: 'std_006', studentName: 'Tariq Sheikh', rollNumber: 'CS2021006', days: 28, status: 'pending',   requestedAt: d(0, 3) },
      { id: 'reb_seed_007', studentId: 'std_007', studentName: 'Nasir Bhat',   rollNumber: 'CS2021007', days: 10, status: 'cancelled', requestedAt: d(12), reviewedAt: reviewed(12) },
      { id: 'reb_seed_008', studentId: 'std_008', studentName: 'Umar Dar',     rollNumber: 'CS2021008', days: 14, status: 'approved',  requestedAt: d(15), reviewedAt: reviewed(13), reviewedBy: 'Hostel Manager' },
    ];
  }

  private save(requests: RebateRequest[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to save rebates to storage:', error);
    }
  }
}

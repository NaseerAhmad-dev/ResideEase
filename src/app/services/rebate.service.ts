import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RebateRequest, RebateDays } from '../models/rebate.model';

@Injectable({ providedIn: 'root' })
export class RebateService {
  private requests = new BehaviorSubject<RebateRequest[]>([]);
  private readonly STORAGE_KEY = 'hostel-rebates';

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
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) this.requests.next(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to load rebates from storage:', error);
    }
  }

  private save(requests: RebateRequest[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to save rebates to storage:', error);
    }
  }
}

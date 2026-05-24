import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StudentNotification {
  id:        string;
  studentId: string;
  type:      'bill' | 'announcement' | 'info';
  title:     string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class StudentNotificationService {
  private readonly STORAGE_KEY = 'hostel-student-notifications';
  private readonly notifs$ = new BehaviorSubject<StudentNotification[]>(this.load());

  getForStudent(studentId: string): Observable<StudentNotification[]> {
    return this.notifs$.pipe(
      map(all => all
        .filter(n => n.studentId === studentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      )
    );
  }

  getUnreadCount(studentId: string): Observable<number> {
    return this.notifs$.pipe(
      map(all => all.filter(n => n.studentId === studentId && !n.isRead).length)
    );
  }

  addMany(items: Omit<StudentNotification, 'id' | 'createdAt' | 'isRead'>[]): void {
    const now = new Date().toISOString();
    const created: StudentNotification[] = items.map((n, i) => ({
      ...n,
      id:        `sn_${Date.now()}_${i}`,
      isRead:    false,
      createdAt: now,
    }));
    const updated = [...created, ...this.notifs$.getValue()];
    this.save(updated);
    this.notifs$.next(updated);
  }

  markRead(id: string): void {
    const updated = this.notifs$.getValue().map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.save(updated);
    this.notifs$.next(updated);
  }

  markAllReadForStudent(studentId: string): void {
    const updated = this.notifs$.getValue().map(n =>
      n.studentId === studentId ? { ...n, isRead: true } : n
    );
    this.save(updated);
    this.notifs$.next(updated);
  }

  private load(): StudentNotification[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private save(notifs: StudentNotification[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifs));
  }
}

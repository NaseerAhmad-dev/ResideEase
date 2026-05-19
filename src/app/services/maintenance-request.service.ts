import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MaintenanceRequest } from '../models/maintenance-request.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceRequestService {
  private readonly requests  = new BehaviorSubject<MaintenanceRequest[]>([]);
  private readonly STORAGE_KEY  = 'hostel-maintenance-requests';
  private readonly VERSION_KEY  = 'hostel-maintenance-requests-version';
  private readonly SEED_VERSION = 'v1-initial';

  constructor() { this.load(); }

  getRequests(): Observable<MaintenanceRequest[]> { return this.requests.asObservable(); }
  getRequestsValue(): MaintenanceRequest[]         { return this.requests.value; }

  updateStatus(id: string, status: MaintenanceRequest['status']): void {
    const resolvedAt = status === 'resolved' ? new Date().toISOString() : undefined;
    const updated = this.requests.value.map(r =>
      r.id === id ? { ...r, status, ...(resolvedAt ? { resolvedAt } : {}) } : r
    );
    this.requests.next(updated);
    this.save(updated);
  }

  private genId(): string { return 'mnt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9); }

  private ticketNum(index: number): string {
    return 'TKT-' + String(1000 + index).padStart(4, '0');
  }

  private load(): void {
    try {
      if (localStorage.getItem(this.VERSION_KEY) !== this.SEED_VERSION) {
        const seed = this.seed();
        this.requests.next(seed);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
        localStorage.setItem(this.VERSION_KEY, this.SEED_VERSION);
      } else {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        this.requests.next(raw ? JSON.parse(raw) : this.seed());
      }
    } catch { this.requests.next(this.seed()); }
  }

  private save(reqs: MaintenanceRequest[]): void {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reqs)); } catch { /* noop */ }
  }

  private seed(): MaintenanceRequest[] {
    const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
    return [
      {
        id: this.genId(), ticketNumber: 'TKT-1001',
        studentName: 'Aanya Sharma', rollNumber: 'CSE-221', roomNumber: '204',
        category: 'plumbing', title: 'Tap leaking in washroom',
        description: 'The hot water tap in the attached washroom has been dripping continuously since two days.',
        priority: 'high', status: 'open', raisedAt: ago(1)
      },
      {
        id: this.genId(), ticketNumber: 'TKT-1002',
        studentName: 'Rohan Mehta', rollNumber: 'CSE-221', roomNumber: '112',
        category: 'plumbing', title: 'Clogged drain in bathroom',
        description: 'Water is not draining properly in the bathroom. The floor stays wet after showering.',
        priority: 'urgent', status: 'in-progress', raisedAt: ago(2)
      },
      {
        id: this.genId(), ticketNumber: 'TKT-1003',
        studentName: 'Priya Nair', rollNumber: 'ECE-310', roomNumber: '301',
        category: 'electrical', title: 'Room light not working',
        description: 'The ceiling light in the room stopped working. The bulb has been replaced but still no power.',
        priority: 'high', status: 'resolved', raisedAt: ago(5), resolvedAt: ago(3)
      },
      {
        id: this.genId(), ticketNumber: 'TKT-1004',
        studentName: 'Kiran Verma', rollNumber: 'ME-405', roomNumber: '408',
        category: 'appliance', title: 'Room fan making loud noise',
        description: 'The ceiling fan produces a rattling sound at medium and high speeds. It is very disturbing during study hours.',
        priority: 'medium', status: 'open', raisedAt: ago(3)
      },
      {
        id: this.genId(), ticketNumber: 'TKT-1005',
        studentName: 'Suresh Babu', rollNumber: 'CS-118', roomNumber: '105',
        category: 'carpentry', title: 'Wardrobe door hinge broken',
        description: 'The hinge on the wardrobe door is broken. The door cannot be closed properly.',
        priority: 'low', status: 'open', raisedAt: ago(4)
      },
      {
        id: this.genId(), ticketNumber: 'TKT-1006',
        studentName: 'Divya Patel', rollNumber: 'IT-207', roomNumber: '212',
        category: 'cleaning', title: 'Common area not cleaned',
        description: 'The corridor on the second floor has not been cleaned for the past three days. Garbage is piling up near the staircase.',
        priority: 'medium', status: 'resolved', raisedAt: ago(6), resolvedAt: ago(1)
      },
      {
        id: this.genId(), ticketNumber: 'TKT-1007',
        studentName: 'Arjun Singh', rollNumber: 'CE-312', roomNumber: '315',
        category: 'electrical', title: 'Power socket not working',
        description: 'The 5A power socket near the study desk is dead. Unable to charge devices.',
        priority: 'high', status: 'in-progress', raisedAt: ago(2)
      },
      {
        id: this.genId(), ticketNumber: 'TKT-1008',
        studentName: 'Meera Iyer', rollNumber: 'CS-223', roomNumber: '220',
        category: 'other', title: 'Window latch broken',
        description: 'The window latch in the room is broken and the window cannot be locked. This is a security concern.',
        priority: 'medium', status: 'closed', raisedAt: ago(10), resolvedAt: ago(7)
      }
    ];
  }
}

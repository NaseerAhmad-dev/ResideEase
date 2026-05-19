import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupplierBill } from '../models/supplier-bill.model';

const STORAGE_KEY = 'hostel-supplier-bills';
const VERSION_KEY = 'hostel-supplier-bills-version';
const SEED_VERSION = 'v1-initial';

const SEED_BILLS: SupplierBill[] = [
  {
    id: 'bill-001', billNumber: 'INV-2026-001', supplierName: 'Al-Noor Grocery Mart',
    category: 'food', amount: 18500, billDate: '2026-05-14',
    description: 'Monthly grocery supply — rice, dal, vegetables, oil',
    registeredAt: '2026-05-14T10:30:00', status: 'paid'
  },
  {
    id: 'bill-002', billNumber: 'INV-2026-002', supplierName: 'City Electricals',
    category: 'utilities', amount: 6200, billDate: '2026-05-15',
    description: 'Electricity bill for hostel block A & B — April cycle',
    registeredAt: '2026-05-15T09:00:00', status: 'approved'
  },
  {
    id: 'bill-003', billNumber: 'INV-2026-003', supplierName: 'Khan Plumbing Works',
    category: 'maintenance', amount: 3400, billDate: '2026-05-16',
    description: 'Water pipe repair and bathroom fixture replacement — east wing',
    registeredAt: '2026-05-16T14:15:00', status: 'pending'
  },
  {
    id: 'bill-004', billNumber: 'INV-2026-004', supplierName: 'Clean Pro Services',
    category: 'cleaning', amount: 4800, billDate: '2026-05-17',
    description: 'Deep cleaning of mess area and common rooms — weekly service',
    registeredAt: '2026-05-17T11:00:00', status: 'pending'
  },
  {
    id: 'bill-005', billNumber: 'INV-2026-005', supplierName: 'Modern Furniture House',
    category: 'furniture', amount: 22000, billDate: '2026-05-18',
    description: '4 study tables and 8 chairs for new rooms in block C',
    registeredAt: '2026-05-18T16:30:00', status: 'pending'
  },
];

@Injectable({ providedIn: 'root' })
export class SupplierBillService {
  private readonly bills$ = new BehaviorSubject<SupplierBill[]>([]);

  constructor() { this.init(); }

  private init(): void {
    if (localStorage.getItem(VERSION_KEY) !== SEED_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BILLS));
      localStorage.setItem(VERSION_KEY, SEED_VERSION);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    this.bills$.next(raw ? JSON.parse(raw) : []);
  }

  private save(bills: SupplierBill[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
    this.bills$.next(bills);
  }

  getBills(): Observable<SupplierBill[]> { return this.bills$.asObservable(); }

  addBill(bill: Omit<SupplierBill, 'id' | 'registeredAt' | 'status'>): void {
    const newBill: SupplierBill = {
      ...bill,
      id:           'bill-' + Date.now(),
      registeredAt: new Date().toISOString(),
      status:       'pending'
    };
    this.save([newBill, ...this.bills$.value]);
  }

  updateStatus(id: string, status: SupplierBill['status']): void {
    this.save(this.bills$.value.map(b => b.id === id ? { ...b, status } : b));
  }

  deleteBill(id: string): void {
    this.save(this.bills$.value.filter(b => b.id !== id));
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly rooms = new BehaviorSubject<Room[]>([]);
  private readonly STORAGE_KEY = 'hostel-rooms';
  private readonly VERSION_KEY  = 'hostel-rooms-seed-version';
  private readonly SEED_VERSION = 'v1-initial';

  constructor() { this.loadRooms(); }

  getRooms(): Observable<Room[]>    { return this.rooms.asObservable(); }
  getRoomsValue(): Room[]           { return this.rooms.value; }
  getRoomById(id: string): Room | undefined {
    return this.rooms.value.find(r => r.id === id);
  }

  updateRoom(id: string, updates: Partial<Room>): void {
    const updated = this.rooms.value.map(r => r.id === id ? { ...r, ...updates } : r);
    this.rooms.next(updated);
    this.saveToStorage(updated);
  }

  private loadRooms(): void {
    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      if (storedVersion !== this.SEED_VERSION) {
        const seed = this.getSeedRooms();
        this.rooms.next(seed);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
        localStorage.setItem(this.VERSION_KEY, this.SEED_VERSION);
      } else {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        this.rooms.next(raw ? JSON.parse(raw) : this.getSeedRooms());
      }
    } catch {
      this.rooms.next(this.getSeedRooms());
    }
  }

  private saveToStorage(rooms: Room[]): void {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rooms)); } catch { /* noop */ }
  }

  private getSeedRooms(): Room[] {
    const d = '2024-01-01T00:00:00.000Z';
    return [
      // ── Floor 1 ──────────────────────────────────────────────────────
      { id: 'room_101', roomNumber: '101', floor: 1, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_104', roomNumber: '104', floor: 1, type: 'double', capacity: 2, price: 5500, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
      { id: 'room_108', roomNumber: '108', floor: 1, type: 'single', capacity: 1, price: 8000, status: 'active',      amenities: ['Private Bathroom', 'Study Desk', 'Wardrobe', 'AC'],          createdAt: d },
      { id: 'room_113', roomNumber: '113', floor: 1, type: 'double', capacity: 2, price: 5500, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
      { id: 'room_117', roomNumber: '117', floor: 1, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_120', roomNumber: '120', floor: 1, type: 'single', capacity: 1, price: 8000, status: 'active',      amenities: ['Private Bathroom', 'Study Desk', 'Wardrobe', 'AC'],          createdAt: d },

      // ── Floor 2 ──────────────────────────────────────────────────────
      { id: 'room_202', roomNumber: '202', floor: 2, type: 'single', capacity: 1, price: 8000, status: 'active',      amenities: ['Private Bathroom', 'Study Desk', 'Wardrobe', 'AC'],          createdAt: d },
      { id: 'room_205', roomNumber: '205', floor: 2, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_210', roomNumber: '210', floor: 2, type: 'double', capacity: 2, price: 5500, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
      { id: 'room_215', roomNumber: '215', floor: 2, type: 'single', capacity: 1, price: 8000, status: 'active',      amenities: ['Private Bathroom', 'Study Desk', 'Wardrobe', 'AC'],          createdAt: d },
      { id: 'room_219', roomNumber: '219', floor: 2, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_223', roomNumber: '223', floor: 2, type: 'double', capacity: 2, price: 5500, status: 'maintenance', amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },

      // ── Floor 3 ──────────────────────────────────────────────────────
      { id: 'room_303', roomNumber: '303', floor: 3, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_309', roomNumber: '309', floor: 3, type: 'double', capacity: 2, price: 5500, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
      { id: 'room_314', roomNumber: '314', floor: 3, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_318', roomNumber: '318', floor: 3, type: 'single', capacity: 1, price: 8000, status: 'active',      amenities: ['Private Bathroom', 'Study Desk', 'Wardrobe', 'AC'],          createdAt: d },
      { id: 'room_321', roomNumber: '321', floor: 3, type: 'single', capacity: 1, price: 8000, status: 'active',      amenities: ['Private Bathroom', 'Study Desk', 'Wardrobe', 'AC'],          createdAt: d },

      // ── Floor 4 ──────────────────────────────────────────────────────
      { id: 'room_401', roomNumber: '401', floor: 4, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_406', roomNumber: '406', floor: 4, type: 'double', capacity: 2, price: 5500, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
      { id: 'room_412', roomNumber: '412', floor: 4, type: 'single', capacity: 1, price: 8000, status: 'active',      amenities: ['Private Bathroom', 'Study Desk', 'Wardrobe', 'AC'],          createdAt: d },
      { id: 'room_416', roomNumber: '416', floor: 4, type: 'double', capacity: 2, price: 5500, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
      { id: 'room_420', roomNumber: '420', floor: 4, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },

      // ── Floor 5 ──────────────────────────────────────────────────────
      { id: 'room_502', roomNumber: '502', floor: 5, type: 'triple', capacity: 3, price: 3800, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×3', 'Lockers ×3', 'Fan'],   createdAt: d },
      { id: 'room_507', roomNumber: '507', floor: 5, type: 'double', capacity: 2, price: 5500, status: 'active',      amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
      { id: 'room_512', roomNumber: '512', floor: 5, type: 'double', capacity: 2, price: 5500, status: 'maintenance', amenities: ['Shared Bathroom', 'Study Desks ×2', 'Wardrobes ×2', 'AC'],  createdAt: d },
    ];
  }
}

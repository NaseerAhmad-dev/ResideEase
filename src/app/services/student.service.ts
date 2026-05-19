import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Student } from '../models/student.model';
import { MessService } from './mess.service';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly students = new BehaviorSubject<Student[]>([]);
  private readonly STORAGE_KEY = 'hostel-students';
  private readonly VERSION_KEY = 'hostel-students-seed-version';
  private readonly SEED_VERSION = 'v5-payment-fields';

  constructor(@Inject(MessService) private readonly messService: MessService) {
    this.loadStudents();
  }

  getStudents() { return this.students.asObservable(); }
  getStudentsValue() { return this.students.value; }

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const newStudent: Student = { ...student, id: this.generateId(), createdAt: new Date().toISOString() };
    const updated = [...this.students.value, newStudent];
    this.students.next(updated);
    this.saveToStorage(updated);
    this.messService.notifyNewStudent(`${newStudent.firstName} ${newStudent.lastName}`);
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): void {
    const updated = this.students.value.map(s => s.id === id ? { ...s, ...updates } : s);
    this.students.next(updated);
    this.saveToStorage(updated);
  }

  deleteStudent(id: string): void {
    const updated = this.students.value.filter(s => s.id !== id);
    this.students.next(updated);
    this.saveToStorage(updated);
  }

  getStudentById(id: string): Student | undefined {
    return this.students.value.find(s => s.id === id);
  }

  private generateId(): string {
    return 'stu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
  }

  private loadStudents(): void {
    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      if (storedVersion !== this.SEED_VERSION) {
        const seed = this.getSeedStudents();
        this.students.next(seed);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
        localStorage.setItem(this.VERSION_KEY, this.SEED_VERSION);
      } else {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        this.students.next(raw ? JSON.parse(raw) : this.getSeedStudents());
      }
    } catch {
      this.students.next(this.getSeedStudents());
    }
  }

  private saveToStorage(students: Student[]): void {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students)); } catch { /* noop */ }
  }

  private getSeedStudents(): Student[] {
    return [
      {
        id: 'demo_001', firstName: 'Amir', lastName: 'Wani',
        email: 'amir.wani@university.edu', phone: '9419001234',
        rollNumber: 'CS2021001', gender: 'male', department: 'Computer Science',
        currentSemester: '5th Semester', checkInDate: '2025-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '101',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 8900, paymentStatus: 'paid', lastPaymentDate: '2025-08-01',
        residencyAccount: 'university', status: 'active', createdAt: '2025-08-01T09:00:00.000Z'
      },
      {
        id: 'demo_002', firstName: 'Zara', lastName: 'Rather',
        email: 'zara.rather@university.edu', phone: '9419005678',
        rollNumber: 'EC2021045', gender: 'female', department: 'Electronics & Comm.',
        currentSemester: '3rd Semester', checkInDate: '2025-07-15',
        residenceExpiry: '2026-06-30', roomNumber: '104',
        selectedRoom: 'Double Sharing', roomPrice: 5500,
        maintenanceCharge: 500, securityDeposit: 2000, messFee: 3200,
        totalPayment: 11200, paidAmount: 11200, paymentStatus: 'paid', lastPaymentDate: '2025-07-15',
        residencyAccount: 'university', status: 'active', createdAt: '2025-07-15T10:30:00.000Z'
      },
      {
        id: 'demo_003', firstName: 'Bilal', lastName: 'Lone',
        email: 'bilal.lone@university.edu', phone: '9797009999',
        rollNumber: 'CE2021003', gender: 'male', department: 'Civil Engg.',
        currentSemester: '7th Semester', checkInDate: '2025-11-01',
        residenceExpiry: '2026-10-31', roomNumber: '108',
        selectedRoom: 'Single', roomPrice: 8000,
        maintenanceCharge: 600, securityDeposit: 3000, messFee: 3200,
        totalPayment: 14800, paidAmount: 14800, paymentStatus: 'paid', lastPaymentDate: '2025-11-01',
        residencyAccount: 'residency', status: 'active', createdAt: '2025-10-20T08:00:00.000Z'
      },
      {
        id: 'demo_004', firstName: 'Hina', lastName: 'Bhat',
        email: 'hina.bhat@university.edu', phone: '9906112345',
        rollNumber: 'MA2022067', gender: 'female', department: 'Mathematics',
        currentSemester: '2nd Semester', checkInDate: '2025-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '113',
        selectedRoom: 'Double Sharing', roomPrice: 5500,
        maintenanceCharge: 500, securityDeposit: 2000, messFee: 3200,
        totalPayment: 11200, paidAmount: 8000, paymentStatus: 'partial', lastPaymentDate: '2025-09-01',
        residencyAccount: 'university', status: 'active', createdAt: '2025-07-28T14:00:00.000Z'
      },
      {
        id: 'demo_005', firstName: 'Umar', lastName: 'Mir',
        email: 'umar.mir@university.edu', phone: '9419078901',
        rollNumber: 'ME2020012', gender: 'male', department: 'Mechanical Engg.',
        currentSemester: '6th Semester', checkInDate: '2024-08-01',
        residenceExpiry: '2025-07-31', roomNumber: '117',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 5400, paymentStatus: 'overdue', lastPaymentDate: '2024-10-15',
        residencyAccount: 'university', status: 'expired', createdAt: '2024-07-20T11:00:00.000Z'
      },
      {
        id: 'demo_006', firstName: 'Sana', lastName: 'Malik',
        email: 'sana.malik@university.edu', phone: '9622034521',
        rollNumber: 'CS2023089', gender: 'female', department: 'Computer Science',
        currentSemester: '1st Semester', checkInDate: '2025-11-15',
        residenceExpiry: '2026-11-14', roomNumber: '202',
        selectedRoom: 'Single', roomPrice: 8000,
        maintenanceCharge: 600, securityDeposit: 3000, messFee: 3200,
        totalPayment: 14800, paidAmount: 3000, paymentStatus: 'partial', lastPaymentDate: '2025-11-10',
        residencyAccount: 'residency', status: 'pending', createdAt: '2025-11-10T09:30:00.000Z'
      },
      {
        id: 'demo_007', firstName: 'Tariq', lastName: 'Shah',
        email: 'tariq.shah@university.edu', phone: '9419056712',
        rollNumber: 'PH2019034', gender: 'male', department: 'Physics',
        currentSemester: '4th Semester', checkInDate: '2024-08-01',
        residenceExpiry: '2026-01-31', roomNumber: '205',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 8900, paymentStatus: 'paid', lastPaymentDate: '2025-02-01',
        residencyAccount: 'university', status: 'active', createdAt: '2024-07-25T10:00:00.000Z'
      },
      {
        id: 'demo_008', firstName: 'Ruqaiya', lastName: 'Ganie',
        email: 'ruqaiya.ganie@university.edu', phone: '9906098765',
        rollNumber: 'BT2023056', gender: 'female', department: 'Biotechnology',
        currentSemester: '2nd Semester', checkInDate: '2025-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '210',
        selectedRoom: 'Double Sharing', roomPrice: 5500,
        maintenanceCharge: 500, securityDeposit: 2000, messFee: 3200,
        totalPayment: 11200, paidAmount: 11200, paymentStatus: 'paid', lastPaymentDate: '2025-08-01',
        residencyAccount: 'university', status: 'active', createdAt: '2025-07-30T08:45:00.000Z'
      },
      {
        id: 'demo_009', firstName: 'Faisal', lastName: 'Dar',
        email: 'faisal.dar@university.edu', phone: '9419023456',
        rollNumber: 'CH2020078', gender: 'male', department: 'Chemistry',
        currentSemester: '8th Semester', checkInDate: '2024-08-01',
        residenceExpiry: '2025-12-31', roomNumber: '215',
        selectedRoom: 'Single', roomPrice: 8000,
        maintenanceCharge: 600, securityDeposit: 3000, messFee: 3200,
        totalPayment: 14800, paidAmount: 9200, paymentStatus: 'overdue', lastPaymentDate: '2024-12-01',
        residencyAccount: 'residency', status: 'expired', createdAt: '2024-07-22T12:00:00.000Z'
      },
      {
        id: 'demo_010', firstName: 'Nadia', lastName: 'Najar',
        email: 'nadia.najar@university.edu', phone: '9797045678',
        rollNumber: 'DS2022091', gender: 'female', department: 'Data Science',
        currentSemester: '3rd Semester', checkInDate: '2025-01-01',
        residenceExpiry: '2026-12-31', roomNumber: '219',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 8900, paymentStatus: 'paid', lastPaymentDate: '2025-01-01',
        residencyAccount: 'university', status: 'active', createdAt: '2024-12-15T14:30:00.000Z'
      },
      {
        id: 'demo_011', firstName: 'Imran', lastName: 'Parray',
        email: 'imran.parray@university.edu', phone: '9419067890',
        rollNumber: 'IT2021023', gender: 'male', department: 'Information Technology',
        currentSemester: '5th Semester', checkInDate: '2025-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '303',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 5700, paymentStatus: 'partial', lastPaymentDate: '2025-10-01',
        residencyAccount: 'university', status: 'active', createdAt: '2025-07-18T09:15:00.000Z'
      },
      {
        id: 'demo_012', firstName: 'Asiya', lastName: 'Khanday',
        email: 'asiya.khanday@university.edu', phone: '9906134567',
        rollNumber: 'CS2022112', gender: 'female', department: 'Computer Science',
        currentSemester: '4th Semester', checkInDate: '2025-06-01',
        residenceExpiry: '2026-05-31', roomNumber: '309',
        selectedRoom: 'Double Sharing', roomPrice: 5500,
        maintenanceCharge: 500, securityDeposit: 2000, messFee: 3200,
        totalPayment: 11200, paidAmount: 11200, paymentStatus: 'paid', lastPaymentDate: '2025-06-01',
        residencyAccount: 'university', status: 'active', createdAt: '2025-05-20T16:00:00.000Z'
      },
      {
        id: 'demo_013', firstName: 'Waseem', lastName: 'Bhat',
        email: 'waseem.bhat@university.edu', phone: '9622056789',
        rollNumber: 'EE2023034', gender: 'male', department: 'Electrical Engg.',
        currentSemester: '1st Semester', checkInDate: '2025-11-01',
        residenceExpiry: '2026-10-31', roomNumber: '314',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 8900, paymentStatus: 'paid', lastPaymentDate: '2025-11-01',
        residencyAccount: 'university', status: 'active', createdAt: '2025-10-25T10:45:00.000Z'
      },
      {
        id: 'demo_014', firstName: 'Lubna', lastName: 'Sofi',
        email: 'lubna.sofi@university.edu', phone: '9419089012',
        rollNumber: 'AR2019056', gender: 'female', department: 'Architecture',
        currentSemester: '8th Semester', checkInDate: '2024-01-01',
        residenceExpiry: '2025-08-31', roomNumber: '318',
        selectedRoom: 'Single', roomPrice: 8000,
        maintenanceCharge: 600, securityDeposit: 3000, messFee: 3200,
        totalPayment: 14800, paidAmount: 14800, paymentStatus: 'paid', lastPaymentDate: '2024-08-01',
        residencyAccount: 'residency', status: 'active', createdAt: '2023-12-20T11:30:00.000Z'
      },
      {
        id: 'demo_015', firstName: 'Adil', lastName: 'Magray',
        email: 'adil.magray@university.edu', phone: '9797078901',
        rollNumber: 'AE2022078', gender: 'male', department: 'Aerospace Engg.',
        currentSemester: '2nd Semester', checkInDate: '2025-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '401',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 4500, paymentStatus: 'partial', lastPaymentDate: '2025-10-15',
        residencyAccount: 'university', status: 'active', createdAt: '2025-07-22T13:00:00.000Z'
      },
      {
        id: 'demo_016', firstName: 'Shaheena', lastName: 'Wani',
        email: 'shaheena.wani@university.edu', phone: '9906167890',
        rollNumber: 'ECO2022045', gender: 'female', department: 'Economics',
        currentSemester: '3rd Semester', checkInDate: '2025-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '406',
        selectedRoom: 'Double Sharing', roomPrice: 5500,
        maintenanceCharge: 500, securityDeposit: 2000, messFee: 3200,
        totalPayment: 11200, paidAmount: 11200, paymentStatus: 'paid', lastPaymentDate: '2025-08-01',
        residencyAccount: 'university', status: 'checked_out', createdAt: '2025-07-15T08:00:00.000Z'
      },
      {
        id: 'demo_017', firstName: 'Junaid', lastName: 'Mir',
        email: 'junaid.mir@university.edu', phone: '9419012345',
        rollNumber: 'EN2020067', gender: 'male', department: 'Environmental Engg.',
        currentSemester: '6th Semester', checkInDate: '2024-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '412',
        selectedRoom: 'Single', roomPrice: 8000,
        maintenanceCharge: 600, securityDeposit: 3000, messFee: 3200,
        totalPayment: 14800, paidAmount: 14800, paymentStatus: 'paid', lastPaymentDate: '2025-08-01',
        residencyAccount: 'residency', status: 'active', createdAt: '2024-07-18T09:00:00.000Z'
      },
      {
        id: 'demo_018', firstName: 'Rafia', lastName: 'Rather',
        email: 'rafia.rather@university.edu', phone: '9622089012',
        rollNumber: 'MBA2022089', gender: 'female', department: 'MBA',
        currentSemester: '4th Semester', checkInDate: '2025-08-01',
        residenceExpiry: '2026-07-31', roomNumber: '416',
        selectedRoom: 'Double Sharing', roomPrice: 5500,
        maintenanceCharge: 500, securityDeposit: 2000, messFee: 3200,
        totalPayment: 11200, paidAmount: 2000, paymentStatus: 'partial', lastPaymentDate: '2025-08-05',
        residencyAccount: 'university', status: 'pending', createdAt: '2025-07-10T15:30:00.000Z'
      },
      {
        id: 'demo_019', firstName: 'Mudasir', lastName: 'Lone',
        email: 'mudasir.lone@university.edu', phone: '9797090123',
        rollNumber: 'PH2021056', gender: 'male', department: 'Pharmacy',
        currentSemester: '5th Semester', checkInDate: '2025-02-01',
        residenceExpiry: '2026-01-31', roomNumber: '502',
        selectedRoom: 'Triple Sharing', roomPrice: 3800,
        maintenanceCharge: 400, securityDeposit: 1500, messFee: 3200,
        totalPayment: 8900, paidAmount: 8900, paymentStatus: 'paid', lastPaymentDate: '2025-02-01',
        residencyAccount: 'university', status: 'active', createdAt: '2025-01-15T10:00:00.000Z'
      },
      {
        id: 'demo_020', firstName: 'Fareeda', lastName: 'Bhat',
        email: 'fareeda.bhat@university.edu', phone: '9906190123',
        rollNumber: 'DS2020111', gender: 'female', department: 'Data Science',
        currentSemester: '7th Semester', checkInDate: '2024-08-01',
        residenceExpiry: '2025-12-31', roomNumber: '507',
        selectedRoom: 'Double Sharing', roomPrice: 5500,
        maintenanceCharge: 500, securityDeposit: 2000, messFee: 3200,
        totalPayment: 11200, paidAmount: 7000, paymentStatus: 'overdue', lastPaymentDate: '2024-11-01',
        residencyAccount: 'university', status: 'expired', createdAt: '2024-07-12T11:00:00.000Z'
      }
    ];
  }
}

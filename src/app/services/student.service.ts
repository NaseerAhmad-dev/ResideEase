import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Student } from '../models/student.model';
import { MessService } from './mess.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private students = new BehaviorSubject<Student[]>([]);
  private readonly STORAGE_KEY = 'hostel-students';

  constructor(
    @Inject(MessService) private readonly messService: MessService
  ) {
    this.loadStudents();
  }

  getStudents() {
    return this.students.asObservable();
  }

  getStudentsValue() {
    return this.students.value;
  }

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const newStudent: Student = {
      ...student,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };

    const currentStudents = this.students.value;
    const updatedStudents = [...currentStudents, newStudent];
    this.students.next(updatedStudents);
    this.saveToStorage(updatedStudents);
    // Notify mess service about new student
    this.messService.notifyNewStudent(`${newStudent.firstName} ${newStudent.lastName}`);

    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): void {
    const currentStudents = this.students.value;
    const updatedStudents = currentStudents.map(student =>
      student.id === id ? { ...student, ...updates } : student
    );
    this.students.next(updatedStudents);
    this.saveToStorage(updatedStudents);
  }

  deleteStudent(id: string): void {
    const currentStudents = this.students.value;
    const updatedStudents = currentStudents.filter(student => student.id !== id);
    this.students.next(updatedStudents);
    this.saveToStorage(updatedStudents);
  }

  getStudentById(id: string): Student | undefined {
    return this.students.value.find(student => student.id === id);
  }

  private generateId(): string {
    return 'stu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private loadStudents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedStudents = JSON.parse(stored);
        // Ensure demo student is always present
        const hasDemoStudent = parsedStudents.some((s: Student) => s.id === 'demo_student_001');
        if (!hasDemoStudent) {
          parsedStudents.unshift(this.demoStudent());
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsedStudents));
        }
        this.students.next(parsedStudents);
      } else {
        const seed = [this.demoStudent()];
        this.students.next(seed);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
      }
    } catch (error) {
      console.error('Failed to load students from storage:', error);
    }
  }

  private demoStudent(): Student {
    return {
      id: 'demo_student_001',
      firstName: 'Aanya',
      lastName: 'Sharma',
      email: 'aanya.sharma@university.edu',
      phone: '9876543210',
      rollNumber: 'STU001',
      gender: 'female',
      department: 'Computer Science',
      currentSemester: '4th Semester',
      checkInDate: '2025-08-01',
      residenceExpiry: '2026-07-31',
      roomNumber: 'B-204',
      selectedRoom: 'Double Sharing',
      roomPrice: 5500,
      maintenanceCharge: 500,
      securityDeposit: 2000,
      messFee: 3200,
      totalPayment: 11200,
      residencyAccount: 'university',
      status: 'active',
      createdAt: '2025-08-01T09:00:00.000Z'
    };
  }

  private saveToStorage(students: Student[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
      console.error('Failed to save students to storage:', error);
    }
  }
}
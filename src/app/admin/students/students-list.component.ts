import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss'
})
export class StudentsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  students: Student[] = [];
  filteredStudents: Student[] = [];
  selectedStudents: Set<string> = new Set();

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Sorting
  sortField: keyof Student = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filters
  filterForm!: FormGroup;
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  genderOptions = [
    { value: 'all', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not', label: 'Prefer not to say' }
  ];

  constructor(
    private studentService: StudentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeFilterForm();
    this.loadStudents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['all'],
      gender: ['all'],
      department: [''],
      roomType: ['']
    });

    // Apply filters when form changes
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private loadStudents(): void {
    this.studentService.getStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(students => {
        this.students = students;
        this.applyFilters();
      });
  }

  private applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.students];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.rollNumber.toLowerCase().includes(searchTerm) ||
        student.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(student => student.status === filters.status);
    }

    // Gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(student => student.gender === filters.gender);
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(student =>
        student.department?.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    // Room type filter
    if (filters.roomType) {
      filtered = filtered.filter(student =>
        student.selectedRoom.toLowerCase().includes(filters.roomType.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];

      // Handle undefined/null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return this.sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return this.sortDirection === 'asc' ? 1 : -1;

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredStudents = filtered;
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  sortBy(field: keyof Student): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: keyof Student): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  get paginatedStudents(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredStudents.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleStudentSelection(studentId: string): void {
    if (this.selectedStudents.has(studentId)) {
      this.selectedStudents.delete(studentId);
    } else {
      this.selectedStudents.add(studentId);
    }
  }

  selectAllStudents(): void {
    if (this.selectedStudents.size === this.paginatedStudents.length) {
      this.selectedStudents.clear();
    } else {
      this.paginatedStudents.forEach(student => this.selectedStudents.add(student.id));
    }
  }

  isAllSelected(): boolean {
    return this.paginatedStudents.length > 0 &&
           this.selectedStudents.size === this.paginatedStudents.length;
  }

  deleteSelectedStudents(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedStudents.size} student(s)?`)) {
      this.selectedStudents.forEach(id => this.studentService.deleteStudent(id));
      this.selectedStudents.clear();
    }
  }

  deleteStudent(student: Student): void {
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      this.studentService.deleteStudent(student.id);
    }
  }

  exportToCSV(): void {
    const headers = [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Roll Number',
      'Gender', 'Department', 'Check-in Date', 'Room Number', 'Current Semester',
      'Residence Expiry', 'Room Type', 'Room Price', 'Residency Account',
      'Maintenance Charge', 'Security Deposit', 'Mess Fee', 'Total Payment', 'Status', 'Created At'
    ];

    const csvData = this.filteredStudents.map(student => [
      student.id,
      student.firstName,
      student.lastName,
      student.email,
      student.phone,
      student.rollNumber,
      student.gender,
      student.department || '',
      student.checkInDate,
      student.roomNumber || '',
      student.currentSemester,
      student.residenceExpiry,
      student.selectedRoom,
      student.roomPrice,
      student.residencyAccount,
      student.maintenanceCharge,
      student.securityDeposit,
      student.messFee,
      student.totalPayment,
      student.status,
      new Date(student.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJSON(): void {
    const dataStr = JSON.stringify(this.filteredStudents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `students_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: 'all',
      gender: 'all',
      department: '',
      roomType: ''
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  getGenderLabel(gender: string): string {
    switch (gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'other': return 'Other';
      case 'prefer-not': return 'Prefer not to say';
      default: return gender;
    }
  }
}
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [StudentService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  activeTab: 'admin' | 'manager' | 'student' = 'admin';

  adminForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  managerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  studentForm = this.fb.group({
    rollNumber: ['', Validators.required],
    phone: ['', Validators.required]
  });

  adminError   = '';
  managerError = '';
  studentError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    @Inject(StudentService) private readonly studentService: StudentService
  ) {}

  loginAdmin(): void {
    this.adminError = '';
    if (this.adminForm.invalid) {
      this.adminError = 'Please enter username and password.';
      return;
    }
    const { username, password } = this.adminForm.value;
    if (username === 'admin' && password === 'admin123') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.adminError = 'Invalid credentials. Please try again.';
    }
  }

  registerAsGuest(): void {
    this.router.navigate(['/guest/register']);
  }

  loginManager(): void {
    this.managerError = '';
    if (this.managerForm.invalid) {
      this.managerError = 'Please enter username and password.';
      return;
    }
    const { username, password } = this.managerForm.value;
    if (username === 'manager' && password === 'manager123') {
      this.router.navigate(['/manager/dashboard']);
    } else {
      this.managerError = 'Invalid credentials. Please try again.';
    }
  }

  loginStudent(): void {
    this.studentError = '';
    if (this.studentForm.invalid) {
      this.studentError = 'Please enter your roll number and phone number.';
      return;
    }
    const { rollNumber, phone } = this.studentForm.value;
    const normalizedRoll = rollNumber?.toString().trim().toLowerCase();
    const normalizedPhone = phone?.toString().trim();
    const student = this.studentService.getStudentsValue().find(s =>
      s.rollNumber.trim().toLowerCase() === normalizedRoll &&
      s.phone.trim() === normalizedPhone
    );
    if (!student) {
      this.studentError = 'No matching student found. Check your roll number and phone.';
      return;
    }
    this.router.navigate(['/student/profile', student.id]);
  }
}

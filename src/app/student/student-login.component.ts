import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [StudentService],
  templateUrl: './student-login.component.html',
  styleUrls: ['./student-login.component.scss']
})
export class StudentLoginComponent {
  loginForm = this.fb.group({
    rollNumber: ['', [Validators.required]],
    phone: ['', [Validators.required]]
  });

  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    @Inject(StudentService) private readonly studentService: StudentService,
    private readonly router: Router
  ) {}

  fillDemo(): void {
    this.loginForm.setValue({ rollNumber: 'STU001', phone: '9876543210' });
  }

  login(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter your roll number and phone number.';
      return;
    }

    const { rollNumber, phone } = this.loginForm.value;
    const normalizedRoll = rollNumber?.toString().trim().toLowerCase();
    const normalizedPhone = phone?.toString().trim();

    const student = this.studentService.getStudentsValue().find((s: any) =>
      s.rollNumber.trim().toLowerCase() === normalizedRoll &&
      s.phone.trim() === normalizedPhone
    );

    if (!student) {
      this.errorMessage = 'Student not found. Please check your roll number and phone.';
      return;
    }

    this.router.navigate(['/student/profile', student.id]);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GuestService } from '../services/guest.service';
import { GuestRegistration } from '../models/guest.model';

@Component({
  selector: 'app-guest-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guest-register.component.html',
  styleUrls: ['./guest-register.component.scss']
})
export class GuestRegisterComponent implements OnInit, OnDestroy {
  step: 1 | 2 | 3 | 4 = 1;

  detailsForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    aadhaarNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  generatedOtp = '';
  otpError = '';
  guestFee = 0;
  registeredGuest: GuestRegistration | null = null;
  resendTimer = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly guestService: GuestService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.guestFee = this.guestService.getGuestFee();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  get f() { return this.detailsForm.controls; }
  get otpF() { return this.otpForm.controls; }

  submitDetails() {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    const phone = this.detailsForm.value.phone!;
    this.generatedOtp = this.guestService.generateOtp(phone);
    this.startResendTimer();
    this.step = 2;
  }

  verifyOtp() {
    this.otpError = '';
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    const otp = this.otpForm.value.otp!;
    const phone = this.detailsForm.value.phone!;
    if (!this.guestService.validateOtp(otp, phone)) {
      this.otpError = 'Invalid OTP. Please try again.';
      return;
    }
    this.step = 3;
  }

  resendOtp() {
    const phone = this.detailsForm.value.phone!;
    this.generatedOtp = this.guestService.generateOtp(phone);
    this.startResendTimer();
    this.otpError = '';
    this.otpForm.reset();
  }

  private startResendTimer() {
    this.resendTimer = 30;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval!);
        this.resendTimer = 0;
      }
    }, 1000);
  }

  payFee() {
    const { fullName, phone, aadhaarNumber } = this.detailsForm.value;
    this.registeredGuest = this.guestService.registerGuest({
      fullName: fullName!,
      phone: phone!,
      aadhaarNumber: aadhaarNumber!,
      feePaid: true,
      feeAmount: this.guestFee,
      status: 'paid'
    });
    this.step = 4;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  get maskedAadhaar(): string {
    const num = this.detailsForm.value.aadhaarNumber ?? '';
    return 'XXXX XXXX ' + num.slice(-4);
  }
}

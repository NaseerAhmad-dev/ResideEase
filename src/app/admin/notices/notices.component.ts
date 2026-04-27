import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="display:flex;flex-direction:column;gap:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <h1 style="font-size:22px;font-weight:700;color:var(--text-primary);letter-spacing:-0.02em">Notices</h1>
          <p style="font-size:13px;color:var(--text-secondary);margin-top:2px">Manage notices for your hostel</p>
        </div>
        <a routerLink="/admin/students/add" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--brand);color:#fff;border-radius:var(--radius-md);font-size:13.5px;font-weight:600;text-decoration:none;box-shadow:var(--shadow-brand)">+ Add new</a>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:60px 32px;text-align:center;box-shadow:var(--shadow-sm)">
        <div style="font-size:40px;margin-bottom:12px">🚧</div>
        <div style="font-size:16px;font-weight:600;color:var(--text-primary);margin-bottom:6px">Notices module coming soon</div>
        <div style="font-size:13.5px;color:var(--text-secondary)">This section is in the next sprint. Dashboard and Add Student are live.</div>
      </div>
    </div>
  `
})
export class NoticesComponent {}

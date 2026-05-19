import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-notices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coming-soon">
      <svg width="48" height="48" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a6 6 0 00-6 6v3l-2 2v1h16v-1l-2-2V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z"
              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
      <h2>Notices</h2>
      <p>Post and manage hostel announcements — coming soon.</p>
    </div>
  `,
  styles: [`
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.2rem;
      height: 40rem;
      color: var(--text-muted);
      svg { opacity: 0.35; }
      h2 { font-size: 2rem; font-weight: 600; color: var(--text-primary); margin: 0; }
      p  { font-size: 1.4rem; margin: 0; }
    }
  `]
})
export class ManagerNoticesComponent {}

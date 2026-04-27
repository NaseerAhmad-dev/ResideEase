import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  today = new Date();

  kpis = [
    { label: 'Total beds',     value: '500',   sub: 'Total capacity',          color: 'brand'   },
    { label: 'Occupied',       value: '435',   sub: '87% occupancy rate',      color: 'green'   },
    { label: 'Vacant',         value: '65',    sub: '13% available now',       color: 'amber'   },
    { label: 'Pending dues',   value: '₹68K',  sub: '11 students overdue',     color: 'danger'  },
  ];

  checkOuts = [
    { name: 'Rahul Mehta',    room: 'B-204', time: '10:00 AM', avatar: 'RM' },
    { name: 'Priya Nair',     room: 'C-318', time: '11:30 AM', avatar: 'PN' },
    { name: 'Aman Verma',     room: 'A-112', time: '12:00 PM', avatar: 'AV' },
  ];

  checkIns = [
    { name: 'Karan Shah',     room: 'B-207', time: '02:00 PM', avatar: 'KS' },
    { name: 'Sneha Rajan',    room: 'D-401', time: '03:30 PM', avatar: 'SR' },
  ];

  recentStudents = [
    { name: 'Karan Shah',   room: 'B-207', plan: 'Full Board',  status: 'active',  date: 'Apr 17', avatar: 'KS' },
    { name: 'Meera Pillai', room: 'C-302', plan: 'Half Board',  status: 'active',  date: 'Apr 16', avatar: 'MP' },
    { name: 'Dev Anand',    room: 'A-108', plan: 'No Mess',     status: 'pending', date: 'Apr 15', avatar: 'DA' },
    { name: 'Riya Joshi',   room: 'D-405', plan: 'Full Board',  status: 'active',  date: 'Apr 14', avatar: 'RJ' },
    { name: 'Sohail Khan',  room: 'B-210', plan: 'Breakfast',   status: 'overdue', date: 'Apr 13', avatar: 'SK' },
  ];

  roomOccupancy = [
    { type: 'Single rooms',  occupied: 47, total: 50,  pct: 94 },
    { type: 'Double sharing', occupied: 176, total: 200, pct: 88 },
    { type: 'Triple sharing', occupied: 171, total: 225, pct: 76 },
    { type: 'Suite rooms',   occupied: 25,  total: 25,  pct: 100 },
  ];

  messStats = [
    { meal: 'Breakfast', count: 312, total: 435, pct: 72, time: '7–9 AM' },
    { meal: 'Lunch',     count: 287, total: 435, pct: 66, time: '12–2 PM' },
    { meal: 'Dinner',    count: 0,   total: 435, pct: 0,  time: '7–9 PM' },
  ];
}

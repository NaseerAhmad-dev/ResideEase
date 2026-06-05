import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessService } from '../services/mess.service';
import { MessStats } from '../models/mess.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit {
  managerName = 'Mess Manager';
  hostelName  = 'Maple Residency';

  messStats: MessStats = { totalSubscribed: 0, totalServed: 0, pendingStudents: 0, todayDate: '' };

  constructor(private readonly messService: MessService) {}

  ngOnInit(): void {
    this.messStats = this.messService.getTodayStats();
  }

  stats = [
    { title: 'Active residents',  value: '128', subtitle: 'Currently staying',    accent: 'brand' },
    { title: 'Pending requests',  value: '6',   subtitle: 'Awaiting approval',    accent: 'amber' },
    { title: 'Open tasks',        value: '12',  subtitle: 'This week',            accent: 'green' },
    { title: 'Rooms available',   value: '9',   subtitle: 'Ready for occupancy',  accent: 'sky'   }
  ];

  quickActions = [
    { title: 'Review room requests', subtitle: 'Approve or decline room change requests', icon: 'request'     },
    { title: 'Check occupancy',      subtitle: 'View active residents and room status',   icon: 'rooms'       },
    { title: 'Approve maintenance',  subtitle: 'Authorize pending maintenance tickets',   icon: 'maintenance' },
    { title: 'Send notice',          subtitle: 'Publish a new announcement to residents', icon: 'notice'      }
  ];
}

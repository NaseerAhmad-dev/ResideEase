import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StudentService } from '../../services/student.service';
import { RebateService } from '../../services/rebate.service';
import { SupplierBillService } from '../../services/supplier-bill.service';
import { Student } from '../../models/student.model';
import { RebateRequest } from '../../models/rebate.model';
import { SupplierBill } from '../../models/supplier-bill.model';

interface AuditStudentRow {
  studentId: string;
  studentName: string;
  rollNumber: string;
  rebateDays: number;
  billableDays: number;
  billAmount: number;
}

interface AuditResult {
  month: number;
  year: number;
  daysInMonth: number;
  totalSupplierBill: number;
  totalBillableDays: number;
  perDayRate: number;
  billCount: number;
  studentCount: number;
  rebatedCount: number;
  rows: AuditStudentRow[];
  totalStudentBill: number;
}

@Component({
  selector: 'app-manager-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-audit.component.html',
  styleUrl: './manager-audit.component.scss'
})
export class ManagerAuditComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  selectedMonth: number;
  selectedYear: number;

  readonly months = [
    { value: 1,  label: 'January'   },
    { value: 2,  label: 'February'  },
    { value: 3,  label: 'March'     },
    { value: 4,  label: 'April'     },
    { value: 5,  label: 'May'       },
    { value: 6,  label: 'June'      },
    { value: 7,  label: 'July'      },
    { value: 8,  label: 'August'    },
    { value: 9,  label: 'September' },
    { value: 10, label: 'October'   },
    { value: 11, label: 'November'  },
    { value: 12, label: 'December'  },
  ];

  readonly years: number[] = [];

  private allStudents: Student[]        = [];
  private allRebates:  RebateRequest[]  = [];
  private allBills:    SupplierBill[]   = [];

  result: AuditResult | null = null;
  hasRun = false;

  constructor(
    private readonly studentService: StudentService,
    private readonly rebateService:  RebateService,
    private readonly billService:    SupplierBillService
  ) {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear  = now.getFullYear();
    for (let y = now.getFullYear(); y >= 2023; y--) this.years.push(y);
  }

  ngOnInit(): void {
    this.studentService.getStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => this.allStudents = s);

    this.rebateService.getRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => this.allRebates = r);

    this.billService.getBills()
      .pipe(takeUntil(this.destroy$))
      .subscribe(b => this.allBills = b);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runAudit(): void {
    const { selectedMonth: m, selectedYear: y } = this;
    const daysInMonth = new Date(y, m, 0).getDate();

    // Supplier bills for selected month
    const monthBills = this.allBills.filter(b => {
      const d = new Date(b.billDate);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
    const totalSupplierBill = monthBills.reduce((sum, b) => sum + b.amount, 0);

    // Approved rebates for selected month — keyed by studentId, days capped at daysInMonth
    const rebateMap = new Map<string, number>();
    this.allRebates
      .filter(r => {
        if (r.status !== 'approved') return false;
        const d = new Date(r.requestedAt);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      })
      .forEach(r => {
        const prev = rebateMap.get(r.studentId) ?? 0;
        rebateMap.set(r.studentId, Math.min(prev + r.days, daysInMonth));
      });

    // Build per-student rows for active students only
    const activeStudents = this.allStudents.filter(s => s.status === 'active');
    const rowsWithDays = activeStudents.map(s => ({
      studentId:   s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      rollNumber:  s.rollNumber,
      rebateDays:   rebateMap.get(s.id) ?? 0,
      billableDays: daysInMonth - (rebateMap.get(s.id) ?? 0),
    }));

    // Rate is derived from total billable days across ALL students so the full
    // supplier cost is always recovered — rebated students pay less, others pay slightly more
    const totalBillableDays = rowsWithDays.reduce((sum, r) => sum + r.billableDays, 0);
    const perDayRate = totalBillableDays > 0 ? totalSupplierBill / totalBillableDays : 0;

    const rows: AuditStudentRow[] = rowsWithDays
      .map(r => ({ ...r, billAmount: perDayRate * r.billableDays }))
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    this.result = {
      month: m,
      year:  y,
      daysInMonth,
      totalSupplierBill,
      totalBillableDays,
      perDayRate,
      billCount:    monthBills.length,
      studentCount: activeStudents.length,
      rebatedCount: rebateMap.size,
      rows,
      totalStudentBill: rows.reduce((sum, r) => sum + r.billAmount, 0),
    };
    this.hasRun = true;
  }

  get monthLabel(): string {
    return this.months.find(mo => mo.value === this.selectedMonth)?.label ?? '';
  }

  initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}

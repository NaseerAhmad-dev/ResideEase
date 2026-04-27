export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rollNumber: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not';
  department?: string;
  checkInDate: string;
  roomNumber?: string;
  currentSemester: string;
  residenceExpiry: string;
  selectedRoom: string;
  roomPrice: number;
  residencyAccount: 'university' | 'residency';
  maintenanceCharge: number;
  securityDeposit: number;
  messFee: number;
  totalPayment: number;
  profilePicture?: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'pending';
}
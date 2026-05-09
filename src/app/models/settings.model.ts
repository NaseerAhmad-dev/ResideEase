export interface HostelSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
}

export interface RoomSettings {
  id: string;
  label: string;
  price: number;
  enabled: boolean;
}

export interface MealSettings {
  id: string;
  label: string;
  price: number;
  enabled: boolean;
}

export interface SystemSettings {
  allowOnlineBooking: boolean;
  requireApproval: boolean;
  maintenanceMode: boolean;
  notificationsEnabled: boolean;
}

export interface AppSettings {
  hostel: HostelSettings;
  rooms: RoomSettings[];
  meals: MealSettings[];
  dietaryOptions: string[];
  system: SystemSettings;
  guestFee: number;
}
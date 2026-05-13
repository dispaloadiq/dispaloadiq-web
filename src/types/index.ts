export type UserRole = 'owner-op' | 'dispatcher' | 'company' | 'shipper';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  location?: string;
  verified?: boolean;
}

export interface Load {
  id: string;
  from: string;
  to: string;
  rate: string;
  payout: string;
  miles: string;
  type: string;
  pickup: string;
  aiScore: number;
  broker?: string;
  weight?: string;
  status: 'Available' | 'In Transit' | 'Delivered' | 'Pending';
}

export interface Dispatcher {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  reviewCount: number;
  experience: number;
  specializations: string[];
  languages: string[];
  pricing: { model: 'percent' | 'flat' | 'per_load'; value: number; label: string };
  avgRpm: number;
  activeClients: number;
  loadsPerMonth: number;
  responseTime: string;
  verified: boolean;
  topPerformer: boolean;
  bio: string;
  availability: 'available' | 'limited' | 'busy';
}

export interface Client {
  id: string;
  name: string;
  truckType: string;
  plate: string;
  status: 'active' | 'idle';
  currentLoad: string | null;
  eta: string | null;
  rpm: number;
  monthEarnings: number;
}

export interface Truck {
  id: string;
  plate: string;
  type: string;
  driver: string;
  status: 'active' | 'idle' | 'maintenance';
  currentLoad?: string;
  location?: string;
  mileage: number;
}

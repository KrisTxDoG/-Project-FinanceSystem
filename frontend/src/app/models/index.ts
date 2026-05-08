export interface User {
  id?: number;
  username: string;
  email: string;
  displayName?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  displayName?: string;
}

export interface Transaction {
  id?: number;
  description: string;
  type: string;
  amount: number;
  category: string;
  notes?: string;
  transactionDate: Date | string;
  createdAt?: Date | string;
}

export interface Budget {
  id?: number;
  category: string;
  limit: number;
  period: string;
  description?: string;
}

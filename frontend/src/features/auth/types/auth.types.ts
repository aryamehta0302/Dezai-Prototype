import { UserRole } from "@/shared/types/common.types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  universityId?: string;
  universityName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  universityId?: string;
}

export interface AuthSession {
  user: AuthUser;
  isAuthenticated: boolean;
  expiresAt?: string;
}
